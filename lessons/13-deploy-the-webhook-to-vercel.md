# Desplegar el webhook en Vercel

[Ver la lección](https://learning.crafter.run/courses/whatsapp-ai-receptionist/watch/13-deploy-the-webhook-to-vercel)

El servidor pasa de `hono.ts` a `index.ts`, conservando `export default app`. El script de envío de prueba deja de ser el punto de entrada. Drizzle ahora lee el esquema desde `index.ts`.

Importa este repositorio en Vercel y configura las variables de `.env.example` con tus propios valores. Cambia la URL en Kapso a `https://<tu-dominio>/webhooks/whatsapp`. Envía un mensaje de prueba y comprueba el webhook en los logs de Vercel con el servidor local apagado.
