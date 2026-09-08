# WhatsApp AI Receptionist

Código del [curso de Crafter Learning](https://learning.crafter.run/courses/whatsapp-ai-receptionist): Kapso + Hono + AI SDK + Neon + Drizzle + Cal.com.

## Un commit por lección

Este historial reconstruye los puntos de control del curso a partir de las notas y del [código original de Anthony Cueva](https://github.com/cuevaio/receptionist-ai). No es el historial original de la grabación. Las lecciones de presentación, demostración, ngrok y cierre agregan documentación. Las lecciones de implementación agregan el código correspondiente. Se conservan las correcciones editoriales de las notas: actualizaciones de perfiles limitadas al usuario actual y verificación HMAC del cuerpo sin transformar.

Clona el repositorio y elige el punto de control que estás viendo:

```bash
git clone https://github.com/crafter-station/receptionist-ai.git
cd receptionist-ai
git switch --detach lesson-02
bun install
cp .env.example .env
# Completa tus variables antes de ejecutar el ejemplo.
bun start
```

A partir de la lección 03: `bun dev`. En las lecciones 06, 08, 09 y 10: `bun db:migrate` aplica las migraciones a tu base de datos de práctica. La lección 09 requiere una tabla de mensajes de práctica vacía antes de agregar la relación obligatoria con usuarios.

`bun run check` comprueba los tipos. Los ID de modelos son los del material del curso; consulta el catálogo de AI Gateway si tu cuenta necesita otro modelo.

| Punto de control | Lección |
| --- | --- |
| [lesson-00](https://github.com/crafter-station/receptionist-ai/tree/lesson-00) | [Te damos la bienvenida al curso](https://learning.crafter.run/courses/whatsapp-ai-receptionist/watch/00-welcome-to-the-course) |
| [lesson-01](https://github.com/crafter-station/receptionist-ai/tree/lesson-01) | [Conoce al recepcionista en producción](https://learning.crafter.run/courses/whatsapp-ai-receptionist/watch/01-see-the-production-receptionist) |
| [lesson-02](https://github.com/crafter-station/receptionist-ai/tree/lesson-02) | [Envía tu primer mensaje de WhatsApp](https://learning.crafter.run/courses/whatsapp-ai-receptionist/watch/02-send-your-first-whatsapp-message) |
| [lesson-03](https://github.com/crafter-station/receptionist-ai/tree/lesson-03) | [Recibe mensajes de WhatsApp con Hono](https://learning.crafter.run/courses/whatsapp-ai-receptionist/watch/03-receive-whatsapp-messages-with-hono) |
| [lesson-04](https://github.com/crafter-station/receptionist-ai/tree/lesson-04) | [Expón tu webhook local con ngrok](https://learning.crafter.run/courses/whatsapp-ai-receptionist/watch/04-expose-your-local-webhook-with-ngrok) |
| [lesson-05](https://github.com/crafter-station/receptionist-ai/tree/lesson-05) | [Responde en WhatsApp con IA](https://learning.crafter.run/courses/whatsapp-ai-receptionist/watch/05-reply-to-whatsapp-with-ai) |
| [lesson-06](https://github.com/crafter-station/receptionist-ai/tree/lesson-06) | [Persistir usuarios de WhatsApp con Neon y Drizzle](https://learning.crafter.run/courses/whatsapp-ai-receptionist/watch/06-persist-whatsapp-users-with-neon-and-drizzle) |
| [lesson-07](https://github.com/crafter-station/receptionist-ai/tree/lesson-07) | [Actualizar perfiles de usuario con herramientas del AI SDK](https://learning.crafter.run/courses/whatsapp-ai-receptionist/watch/07-update-user-profiles-with-ai-sdk-tools) |
| [lesson-08](https://github.com/crafter-station/receptionist-ai/tree/lesson-08) | [Guardar mensajes entrantes de WhatsApp](https://learning.crafter.run/courses/whatsapp-ai-receptionist/watch/08-store-incoming-whatsapp-messages) |
| [lesson-09](https://github.com/crafter-station/receptionist-ai/tree/lesson-09) | [Agregar el historial reciente de mensajes al prompt del LLM](https://learning.crafter.run/courses/whatsapp-ai-receptionist/watch/09-add-recent-message-history-to-the-llm-prompt) |
| [lesson-10](https://github.com/crafter-station/receptionist-ai/tree/lesson-10) | [Guardar las respuestas de la IA y reconstruir la conversación](https://learning.crafter.run/courses/whatsapp-ai-receptionist/watch/10-store-ai-responses-and-reconstruct-the-conversation) |
| [lesson-11](https://github.com/crafter-station/receptionist-ai/tree/lesson-11) | [Buscar horarios disponibles con Cal.com](https://learning.crafter.run/courses/whatsapp-ai-receptionist/watch/11-find-available-slots-with-cal-com) |
| [lesson-12](https://github.com/crafter-station/receptionist-ai/tree/lesson-12) | [Crear reservas con Cal.com](https://learning.crafter.run/courses/whatsapp-ai-receptionist/watch/12-create-bookings-with-cal-com) |
| [lesson-13](https://github.com/crafter-station/receptionist-ai/tree/lesson-13) | [Desplegar el webhook en Vercel](https://learning.crafter.run/courses/whatsapp-ai-receptionist/watch/13-deploy-the-webhook-to-vercel) |
| [lesson-14](https://github.com/crafter-station/receptionist-ai/tree/lesson-14) | [Verificar las firmas de los webhooks de Kapso](https://learning.crafter.run/courses/whatsapp-ai-receptionist/watch/14-verify-kapso-webhook-signatures) |
| [lesson-15](https://github.com/crafter-station/receptionist-ai/tree/lesson-15) | [Cierre del curso](https://learning.crafter.run/courses/whatsapp-ai-receptionist/watch/15-course-wrap-up) |
