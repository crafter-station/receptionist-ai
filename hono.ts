import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { boolean, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { WhatsAppClient } from "@kapso/whatsapp-cloud-api";
import { generateText, isStepCount, tool } from "ai";
import z from "zod";
import { Hono } from "hono";

export const usersTable = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: varchar({ length: 255 }),
	email: varchar({ length: 255 }),
	phoneNumber: varchar({ length: 255 }).notNull(),
	username: varchar({ length: 255 }).notNull(),
});

export const messagesTable = pgTable("messages", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  content: text(),
  timestamp: timestamp({ withTimezone: true }),
  kapsoId: varchar({ length: 255 }),
  userId: integer().references(() => usersTable.id).notNull(),
  isHuman: boolean().default(true),
});

export type User = typeof usersTable.$inferSelect;

const db = drizzle(process.env.DATABASE_URL!);

const kapso = new WhatsAppClient({
	baseUrl: "https://api.kapso.ai/meta/whatsapp",
	kapsoApiKey: process.env.KAPSO_API_KEY!,
});

const app = new Hono();

app.get("/", (c) => c.text("Hello Kapso!"));

app.post("/webhooks/whatsapp", async (c) => {
  const body = await c.req.json();

  const userPhoneNumber = body.message.from;
  const userUsername = body.message.username;

  const [existingUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.phoneNumber, userPhoneNumber));

let user: User | null = null;

if (existingUser) {
  user = existingUser;
} else {
  const [createdUser] = await db
    .insert(usersTable)
    .values({
      phoneNumber: userPhoneNumber,
      username: userUsername,
    })
    .returning();
  user = createdUser ?? null;
}

if (!user) throw new Error("Could not resolve WhatsApp user");

const userMessage = body.message.text.body;
const userMessageId = body.message.id;
const userMessageTimestamp = body.message.timestamp;

await db.insert(messagesTable).values({
  kapsoId: userMessageId,
  content: userMessage,
  timestamp: new Date(Number(userMessageTimestamp) * 1000),
  userId: user.id,
});

const dbMessages = await db
  .select()
  .from(messagesTable)
  .where(eq(messagesTable.userId, user.id))
  .orderBy(desc(messagesTable.timestamp))
  .limit(10);

const history = dbMessages
  .map(
    (message) => `${message.isHuman ? "Human" : "AI"} at ${message.timestamp}
Content: ${message.content}`,
  )
  .join("\n");

const prompt = `
Eres el agente de agendamiento de citas de Kapso Constructores SAC, una empresa de reparaciones del hogar. Pregunta el nombre al iniciar la conversación. Consulta disponibilidad, pide la dirección y el correo antes de reservar. Pide confirmación explícita antes de crear un booking. Responde al último mensaje del usuario.

Previous messages:
${history}

WhatsApp Username: ${userUsername}
User Name: ${user.name ?? "Unknown"}
User Email: ${user.email ?? "Unknown"}
`;

const { text: aiResponse } = await generateText({
  model: "openai/gpt-5.6-luna",
  prompt,
  stopWhen: isStepCount(10),
  tools: {
updateUserEmail: tool({
  description: "Updates the email of a user in the db",
  inputSchema: z.object({
    email: z.email(),
  }),
  execute: async ({ email }) => {
    await db.update(usersTable).set({ email }).where(eq(usersTable.id, user.id));
    user.email = email;

    return "User email was updated sucessfully.";
  },
}),
createBooking: tool({
  description: "Create a booking",
  inputSchema: z.object({
    startDate: z.iso.datetime({ offset: true }),
    address: z.string(),
    title: z.string(),
    notes: z.string(),
  }),
  execute: async ({ startDate, address, title, notes }) => {
    const options = {
      method: "POST",
      headers: {
        "cal-api-version": "2026-02-25",
        Authorization: `Bearer ${process.env.CAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventTypeId: Number(process.env.CAL_EVENT_TYPE_ID!),
        start: startDate,
        attendee: {
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          timeZone: "America/Lima",
        },
        location: { type: "attendeeAddress", address },
        bookingFieldsResponses: {
          title,
          notes,
        },
      }),
    };

    const response = await fetch(
      "https://api.cal.com/v2/bookings",
      options,
    );

    const json = await response.json();

    console.log(json);

    if (response.ok) {
      return "ok";
    }
    return "something went wrong. try again.";
  },
}),

findSlots: tool({
  description: "Find available slots for booking",
  inputSchema: z.object({}),
  execute: async () => {
    const options = {
      method: "GET",
      headers: {
        "cal-api-version": "2024-09-04",
        Authorization: `Bearer ${process.env.CAL_API_KEY}`,
      },
    };

    const query = new URLSearchParams({
      eventTypeId: process.env.CAL_EVENT_TYPE_ID!,
      start: new Date().toISOString().split("T")[0]!,
      end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]!,
      timeZone: "America/Lima",
    });

    const response = await fetch(
      `https://api.cal.com/v2/slots?${query}`,
      options,
    );
    const json = (await response.json()) as { data: [] };

    console.log(json);

    return json.data;
  },
}),

    updateUserName: tool({
      description: "Updates the name of the current user in the database",
      inputSchema: z.object({
        name: z.string().min(2),
      }),
      execute: async ({ name }) => {
        await db
          .update(usersTable)
          .set({ name })
          .where(eq(usersTable.phoneNumber, userPhoneNumber));
        user.name = name;

        return "User name was updated successfully.";
      },
    }),
  },
});

const kapsoResponse = await kapso.messages.sendText({
  phoneNumberId: process.env.KAPSO_PHONE_NUMBER_ID!,
  to: userPhoneNumber,
  body: aiResponse,
});

await db.insert(messagesTable).values({
  isHuman: false,
  content: aiResponse,
  userId: user.id,
  timestamp: new Date(),
  kapsoId: kapsoResponse.messages[0]?.id,
});

  return c.text("OK");
});

export default app;
