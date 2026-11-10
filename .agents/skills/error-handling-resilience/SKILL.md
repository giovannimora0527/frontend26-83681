---
name: error-handling-resilience
description: Manejar errores HTTP, estados de carga y mensajes al usuario de forma consistente en el frontend.
---

# Error Handling & Resilience

## Procedimiento
1. Inspeccionar cómo maneja hoy el proyecto los errores (interceptor, `catchError`, `ErrorHandler`).
2. Mostrar siempre estados de carga, vacío y error en las pantallas que consumen la API.
3. Mostrar al usuario el mensaje que devuelve el backend cuando es de validación; para errores inesperados, un mensaje genérico sin detalles internos.
4. No tragar errores en silencio ni dejar `console.log` con datos sensibles.
5. Definir un `timeout` explícito solo si el proyecto ya lo hace o si hay una necesidad demostrada.
6. Reintentar únicamente peticiones `get` idempotentes; nunca reintentar un `post` sin estrategia.
7. Evitar que un error en un componente deje la pantalla bloqueada (botones deshabilitados, spinner infinito).

## Validación
Pruebas con respuestas de error simuladas (400, 404, 500 y sin conexión) y revisión manual de los mensajes mostrados.
