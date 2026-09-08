# Expón tu webhook local con ngrok

[Ver la lección](https://learning.crafter.run/courses/whatsapp-ai-receptionist/watch/04-expose-your-local-webhook-with-ngrok)

Con el servidor de la lección anterior ejecutándose con `bun dev`, abre otra terminal:

```bash
ngrok config add-authtoken <tu-token>
ngrok http 3000
```

En Kapso, registra `https://<tu-subdominio>.ngrok-free.app/webhooks/whatsapp`, selecciona el formato de Kapso y el evento `whatsapp.message.received`, sin buffering. Guarda el secreto fuera de Git.

Envía el evento de prueba desde el panel y comprueba que Hono recibe el payload. `localhost` no es accesible desde Kapso; el túnel le da una dirección HTTPS pública temporal. Actualiza la URL en Kapso si cambia al reiniciar ngrok.
