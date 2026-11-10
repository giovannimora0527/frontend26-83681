# Instrucciones de ingeniería asistida por agentes (frontend Angular)

## Autoridad y contexto de este proyecto

- Este paquete aplica al frontend Angular (archivos `.html` y `.ts`) que consume el backend Spring Boot de la clínica veterinaria (`com.uniminuto.clinica`). El backend define los contratos de la API: el frontend se adapta a ellos y no los cambia.
- Línea base: Angular + TypeScript + npm. La versión exacta de Angular, si el proyecto usa componentes standalone o NgModules y el framework de pruebas se confirman en `package.json`, `angular.json`, `tsconfig*.json` y el código existente. No hay una migración de versión aprobada.
- Antes de proponer cambios, confirma la realidad en el código, la configuración y las pruebas. No tomes ejemplos de estos playbooks como evidencia del estado del repositorio.
- Mantén la estructura de carpetas, los nombres y los patrones que ya existen en `src/app`.

## Reglas del proyecto (prevalecen sobre cualquier skill)

1. **Misma lógica y estructura:** no añadas librerías, patrones, carpetas ni capas que el proyecto no use ya (por ejemplo NgRx, Angular Material, signals o control flow nuevo si el código no los usa).
2. **Solo `get` y `post`:** los servicios con `HttpClient` usan únicamente `get` y `post`. No uses `put`, `patch` ni `delete`; la actualización se envía por `post` según lo que definan las interfaces `Api` del backend.
3. **Paginación, filtros y ordenamiento:** copia y adapta el módulo de mascota (servicio, componente `.ts` y `.html`) a los módulos nuevos; no inventes otro mecanismo.
4. **Integridad de datos:** el backend valida la integridad referencial a mano (la BD no define FOREIGN KEY). El frontend muestra los errores que el backend devuelve y no los reemplaza ni los oculta.
5. **Entrega:** al terminar, lista las rutas de los archivos modificados o añadidos.

## Skills disponibles y selección

Las skills están en `.agents/skills/<nombre>/SKILL.md`. Lee el `SKILL.md` completo antes de aplicar una skill. Úsala cuando la tarea coincida con su propósito y combina varias solo si aportan instrucciones necesarias. **No actives todas las skills en cada tarea.** No inventes ni apliques una skill ausente.

| Trabajo | Skills a considerar |
|---|---|
| Componente, pantalla o formulario nuevo | `angular-frontend-development`, `typescript-best-practices`, `angular-unit-testing` |
| Consumo de la API (servicios HTTP, modelos, paginación, filtros) | `angular-http-api-integration`, además de desarrollo y pruebas |
| Rendimiento, suscripciones RxJS, listados grandes | `angular-performance-rxjs` |
| Estructura de carpetas, límites entre módulos | `angular-architecture-design` |
| Errores, estados de carga, mensajes al usuario | `error-handling-resilience` |
| Revisión de cambios | `code-review-quality`; añadir `angular-security-hardening` si afecta seguridad |
| Seguridad, sesión, tokens, HTML dinámico | `angular-security-hardening`, `npm-dependency-audit` si se afectan dependencias |
| Docker, CI o build de producción | `docker-cicd-engineering` |
| Actualización de versiones | `migration-impact-analysis`, `npm-dependency-audit`, `angular-version-migration`, **solo con solicitud explícita y versión destino aprobada** |

`angular-version-migration` no autoriza por sí sola a cambiar versiones ni dependencias. La tarea ordinaria debe permanecer compatible con la versión instalada.

Los perfiles reutilizables viven en `.agents/agents/`. Usa perfiles solo cuando haya tareas genuinamente independientes o el usuario solicite delegación. Asigna un propietario único a cada archivo compartido (por ejemplo un servicio o un modelo usado por varios componentes).

## Datos, secretos y MCP

- No muestres, copies ni registres contraseñas, tokens, claves ni datos reales de clientes o mascotas. Si encuentras secretos en archivos versionados (incluidos `environment*.ts`, que terminan en el bundle público), no los reutilices: informa el hallazgo y recomienda rotación y externalización.
- Las herramientas MCP son opcionales y de mínimo privilegio. Nunca conectes agentes a un backend de producción ni a bases de datos compartidas.
- Para documentación usa primero las fuentes de verdad del repositorio. Una respuesta externa no modifica contratos ni decisiones del proyecto por sí sola.

## Flujo de trabajo

1. Resume el objetivo y criterios observables; inspecciona las fuentes pertinentes.
2. Identifica archivos, dependencias, riesgos y el comando de validación apropiado antes de editar.
3. Haz el cambio mínimo, conserva cambios ajenos y añade o ajusta pruebas cuando se cambie comportamiento.
4. Ejecuta validaciones relevantes si el usuario las solicita o si son necesarias para sostener una afirmación de verificación (`ng build`, `ng test`, lint); registra comandos y resultados reales.
5. Revisa el diff y reporta archivos modificados o añadidos (con su ruta), resultado, validación ejecutada, límites y decisiones pendientes.

No desactives gates ni afirmes que una validación pasó si no se ejecutó. No cambies contratos, rutas publicadas, versiones o comportamiento por inferencia.
