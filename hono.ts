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
Respond to the user's latest message.

Previous messages:
${history}

WhatsApp Username: ${userUsername}
User Name: ${user.name ?? "Unknown"}
User Email: ${user.email ?? "Unknown"}
`;

const { text: aiResponse } = await generateText({
  model: "openai/gpt-5.6-luna",
  prompt,
  stopWhen: isStepCount(5),
  tools: {
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
