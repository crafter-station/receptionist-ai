import { WhatsAppClient } from "@kapso/whatsapp-cloud-api";
import { generateText } from "ai";
import { Hono } from "hono";

const kapso = new WhatsAppClient({
	baseUrl: "https://api.kapso.ai/meta/whatsapp",
	kapsoApiKey: process.env.KAPSO_API_KEY!,
});

const app = new Hono();

app.get("/", (c) => c.text("Hello Kapso!"));

app.post("/webhooks/whatsapp", async (c) => {
  const body = await c.req.json();

  const userPhoneNumber = body.message.from;
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
