---
name: docker-cicd-engineering
description: Mantener builds reproducibles, imágenes seguras y pipelines confiables para el frontend Angular, si el repositorio los tiene.
---

# Docker Cicd Engineering

## Procedimiento
1. Inspeccionar Dockerfile, Compose y pipeline existentes; si no existen, no crearlos salvo solicitud.
2. Usar `npm ci` con el lockfile y una versión de Node alineada entre desarrollo, build y CI.
3. Separar build y runtime (por ejemplo build con Node y servir `dist/` con un servidor web estático).
4. Configurar el fallback de rutas del SPA hacia `index.html`.
5. Recordar que `environment*.ts` se fija en el build: no meter secretos y generar una compilación por entorno.
6. No copiar secretos a imágenes ni capas; usar imágenes base mantenidas y fijar tags según política.
7. Ejecutar `ng build`, pruebas y `npm audit` según las herramientas disponibles.
8. Validar despliegue y rollback en un entorno no productivo.

## Migración
Actualizar la versión de Node de la imagen solo después de validar compatibilidad con la versión de Angular instalada.
