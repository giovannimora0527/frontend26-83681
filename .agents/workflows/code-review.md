# Flujo: revisión de código

1. Seleccionar diff y contexto funcional.
2. Ejecutar `code-reviewer` en modo solo lectura.
3. Revisar seguridad (XSS, tokens), suscripciones, detección de cambios, consumo de la API (solo `get`/`post`), compatibilidad de versión y pruebas.
4. Clasificar hallazgos por severidad.
5. Corregir hallazgos aceptados en cambios separados.
6. Volver a ejecutar `ng build`, `ng test --watch=false` y la revisión.
7. Registrar excepciones aprobadas.

La revisión debe priorizar defectos reales; no bloquear por preferencias estilísticas sin impacto.
