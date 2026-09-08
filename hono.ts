import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { WhatsAppClient } from "@kapso/whatsapp-cloud-api";
import { generateText } from "ai";
import { Hono } from "hono";

export const usersTable = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: varchar({ length: 255 }),
	email: varchar({ length: 255 }),
	phoneNumber: varchar({ length: 255 }).notNull(),
	username: varchar({ length: 255 }).notNull(),
});

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

  if (!existingUser) {
    await db.insert(usersTable).values({
      phoneNumber: userPhoneNumber,
      username: userUsername,
    });
  }

  const userMessage = body.message.text.body;

  const { text: aiResponse } = await generateText({
    model: "openai/gpt-5.6-luna",
    prompt: `Respond to this user message: ${userMessage}`,
  });

  await kapso.messages.sendText({
    phoneNumberId: process.env.KAPSO_PHONE_NUMBER_ID!,
    to: userPhoneNumber,
    body: aiResponse,
  });

  return c.text("OK");
});

export default app;
