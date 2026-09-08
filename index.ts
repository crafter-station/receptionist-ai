import { WhatsAppClient } from "@kapso/whatsapp-cloud-api";

const kapsoApiKey = process.env.KAPSO_API_KEY;
const phoneNumberId = process.env.KAPSO_PHONE_NUMBER_ID;
const recipient = process.env.WHATSAPP_TEST_RECIPIENT;

if (!kapsoApiKey || !phoneNumberId || !recipient) {
  throw new Error("Missing Kapso or WhatsApp configuration");
}

const kapso = new WhatsAppClient({
  baseUrl: "https://api.kapso.ai/meta/whatsapp",
  kapsoApiKey,
});

const response = await kapso.messages.sendText({
  phoneNumberId,
  to: recipient,
  body: "Hello from Bun!",
});

console.log("Message accepted:", response.messages[0]?.id);
