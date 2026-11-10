---
applyTo: "**/package.json"
---
- Inspeccionar `package.json`, el lockfile y `angular.json` antes de editar.
- Mantener todas las dependencias `@angular/*` en la misma versión mayor y compatibles con TypeScript, `zone.js` y `rxjs`.
- No introducir versiones dinámicas (`latest`, `*`) ni duplicar dependencias.
- Justificar cada dependencia nueva y revisar mantenimiento, licencia y vulnerabilidades.
- No usar `--force` ni `--legacy-peer-deps` para ocultar conflictos sin documentarlo.
- No cambiar la versión de Angular en una tarea funcional ordinaria.
