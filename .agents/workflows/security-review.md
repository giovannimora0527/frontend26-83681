# Flujo: revisión de seguridad

1. Identificar activos, datos, actores, límites de confianza y superficie expuesta.
2. Revisar autenticación y autorización (guards solo como experiencia de usuario; la autorización real está en el backend), manejo de tokens y secretos en `environment*.ts`.
3. Revisar XSS (`innerHTML`, `bypassSecurityTrust*`), validación de entradas, almacenamiento en el navegador, exposición de errores y configuración de CORS que el backend debe cumplir.
4. Revisar dependencias (`npm audit`) y configuración de despliegue.
5. Crear pruebas negativas para los hallazgos.
6. Documentar severidad, evidencia, mitigación y riesgo residual.
7. No realizar pruebas ofensivas contra sistemas externos o productivos sin autorización explícita.
