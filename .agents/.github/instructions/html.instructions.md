---
applyTo: "**/*.html"
---
- Usar la sintaxis de plantilla que ya usa el proyecto (`*ngIf`/`*ngFor` o control flow `@if`/`@for`); no mezclar estilos nuevos.
- No poner lógica pesada ni llamadas a métodos costosos dentro de la plantilla.
- Usar `trackBy` (o `track`) en los listados.
- No usar `[innerHTML]` con datos del usuario sin sanitizar.
- Mostrar estados de carga, vacío y error en las pantallas que consumen la API.
- Copiar el patrón de paginación, filtros y ordenamiento de la plantilla del módulo de mascota.
- Usar etiquetas `label` asociadas a sus campos y textos claros en botones.
