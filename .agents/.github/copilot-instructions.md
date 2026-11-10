# GitHub Copilot — instrucciones del repositorio

Este frontend es una aplicación Angular que consume el backend Spring Boot de la clínica veterinaria. La versión exacta de Angular se confirma en `package.json`. No hay una actualización de versión aprobada.

## Comportamiento esperado
- Lee primero `AGENTS.md`, `package.json` y `angular.json`.
- Respeta la estructura, convenciones y patrones existentes en `src/app` antes de proponer otros.
- No añadas librerías, patrones ni carpetas que el proyecto no use ya.
- No actualices versiones ni ejecutes `ng update` como parte de una funcionalidad ordinaria.
- Mantén los componentes delgados: la lógica de negocio y las llamadas HTTP van en servicios.
- Usa `HttpClient` solo con `get` y `post`; no uses `put`, `patch` ni `delete`.
- Para paginación, filtros y ordenamiento copia y adapta el módulo de mascota.
- Usa inyección por constructor, tipos explícitos (sin `any`), `async` pipe o desuscripción segura, y manejo de errores visible para el usuario.
- No uses `innerHTML` con datos sin sanitizar ni `bypassSecurityTrust*` sin justificación.
- No inventes resultados de pruebas ni disponibilidad de APIs.
- Antes de una refactorización amplia, presenta el plan y limita el alcance.
- Selecciona skills del catálogo `.agents/skills/<nombre>/SKILL.md` según la tarea; no actives todas por defecto.
- Para código ordinario considera `angular-frontend-development`, `typescript-best-practices` y `angular-unit-testing`; añade API, rendimiento, seguridad o CI solo si aplica.
- Usa `angular-version-migration` únicamente cuando el usuario solicite actualizar y se apruebe la versión destino exacta.

## Al modificar código
1. Inspecciona componentes, servicios y pruebas relacionadas.
2. Identifica compatibilidad con la versión de Angular y TypeScript instaladas.
3. Implementa el cambio mínimo.
4. Añade o actualiza pruebas.
5. Ejecuta `ng build` y `ng test --watch=false` si están disponibles.
6. Resume los cambios, las rutas de los archivos modificados o añadidos y los resultados reales.

## Migración
Para solicitudes aprobadas de actualización, activa `migration-impact-analysis`, `npm-dependency-audit` y `angular-version-migration`. No asumas que la última versión de Angular es el destino aprobado.
