---
name: angular-http-api-integration
description: Consumir la API del backend con HttpClient (solo get y post), con modelos, paginación, filtros y errores consistentes.
---

# Angular HTTP API Integration

## Procedimiento
1. Leer las interfaces `Api` del backend (ruta, método, `consumes`/`produces`, parámetros) antes de escribir el servicio.
2. Centralizar las llamadas en servicios; los componentes nunca usan `HttpClient` directamente.
3. Usar solo `get` y `post`. La actualización se envía por `post` según lo que defina el backend; no usar `put`, `patch` ni `delete`.
4. Tomar la URL base de la configuración de entorno ya existente (`environment*.ts`); no escribirla a mano en componentes.
5. Reflejar los contratos del backend en interfaces o clases TypeScript. Si falta un campo o el contrato es ambiguo, reportarlo; no inventarlo.
6. Paginación, filtros y ordenamiento: copiar y adaptar el servicio, el componente y la plantilla del módulo de mascota, conservando los nombres de parámetros.
7. Respetar el formato de fechas con que el backend serializa y recibe.
8. Manejar errores con `catchError` en el servicio o con el interceptor existente. El backend valida la integridad referencial a mano; el frontend muestra el mensaje recibido y no lo reemplaza por una validación propia.
9. No mostrar detalles internos del error (trazas, URLs internas) al usuario.

## Validación
Pruebas del servicio con `HttpTestingController`: método, URL, parámetros, cuerpo y caminos de error; revisión manual contra el backend en `ng serve`.
