---
name: angular-security-hardening
description: Revisar e implementar controles de seguridad del frontend Angular (XSS, sesión, tokens, dependencias).
---

# Angular Security Hardening

## Procedimiento
1. Identificar el mecanismo de identidad (si existe), los flujos, los roles y los límites de confianza.
2. Recordar que los guards y ocultar botones solo mejoran la experiencia: la autorización se aplica en el servidor.
3. No usar `[innerHTML]` ni `bypassSecurityTrust*` con datos no confiables; apoyarse en la sanitización de Angular.
4. Si hay tokens, enviarlos con un interceptor, no registrarlos en consola y evitar guardarlos donde se expongan sin necesidad.
5. No guardar secretos en `environment*.ts`: terminan en el bundle público.
6. Validar entradas en el formulario como ayuda al usuario; la validación definitiva la hace el backend.
7. Revisar que los mensajes de error no filtren información interna.
8. Revisar dependencias con `npm audit` y mantener las versiones de Angular con soporte.
9. No desactivar controles de seguridad para facilitar pruebas.

## Validación
Pruebas de acceso denegado, de errores del backend y de plantillas con contenido hostil. No declarar cumplimiento normativo sin evaluación formal.
