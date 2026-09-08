import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.text("Hello Kapso!"));

app.post("/webhooks/whatsapp", async (c) => {
  const body = await c.req.json();

  console.log(body);

  return c.text("OK");
});

export default app;
