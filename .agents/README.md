# frontend-ai-engineering-skills

Paquete de instrucciones, skills, perfiles y flujos de trabajo para el frontend Angular del proyecto. La línea base es **Angular + TypeScript + npm**; la versión exacta se confirma siempre en `package.json` y `angular.json`. Las skills de migración son recursos para una futura actualización, no una decisión ni autorización de migración.

## Objetivo

Estandarizar el trabajo de GitHub Copilot, OpenAI Codex y VS Code Agent Mode. El paquete prioriza:
- cambios pequeños, verificables y trazables;
- respetar la estructura y los patrones que ya existen en `src/app`;
- componentes delgados y lógica HTTP en servicios;
- consumo de la API del backend sin cambiar sus contratos;
- pruebas y revisión de seguridad;
- actualizaciones de versión basadas en evidencia y con aprobación explícita.

## Estado de modernización

No existe una migración aprobada. Si se solicita evaluarla, primero se requiere una decisión explícita sobre la versión exacta de destino, el alcance y las pruebas. No asumir que la última versión de Angular es la aprobada.

## Estructura

```text
.agents/
├── AGENTS.md                 # Reglas para usar las skills en este frontend
├── skills/                   # Skills disponibles (una carpeta por skill)
│   ├── <skill>/SKILL.md
│   ├── agentes.md            # Flujos de agentes para documentar el repo
│   └── plantilla.md          # Plantilla del README que generan esos flujos
├── agents/                   # Perfiles reutilizables de especialista
├── workflows/                # Flujos para desarrollo, revisión y seguridad
└── .github/                  # Plantillas de instrucciones para Copilot
```

## Instalación

Copia la carpeta `.agents/` a la raíz del repositorio del frontend (junto a `package.json`). Las skills quedan en `.agents/skills/<nombre>/SKILL.md` y los perfiles en `.agents/agents/`.

## Uso por herramienta

### OpenAI Codex
- Usa `AGENTS.md` como instrucciones del repositorio (cópialo o enlázalo a la raíz si tu cliente solo lo busca allí).
- Consulta skills desde `.agents/skills/<nombre>/SKILL.md` y elígelas por tarea según `.agents/AGENTS.md`.
- Los perfiles de `.agents/agents/` son plantillas de rol; la delegación depende de la versión/configuración del cliente.

### GitHub Copilot
- `.agents/.github/copilot-instructions.md` y `.agents/.github/instructions/*.instructions.md` son plantillas de este paquete y no se cargan desde esa ruta. Para activarlas, publícalas en `.github/copilot-instructions.md` y `.github/instructions/`.
- Para usar un perfil como agente personalizado, copia `.agents/agents/<nombre>.md` a `.github/agents/<nombre>.agent.md` si tu cliente Copilot lo admite.

### VS Code Agent Mode
- Usa las instrucciones y perfiles de Copilot cuando la versión instalada admita esas funciones.
- Revisa siempre las solicitudes de ejecución de comandos y cambios de archivos.

## Principios de seguridad

- No incluir secretos, tokens, contraseñas ni datos personales reales en prompts, fixtures o logs.
- No ejecutar comandos contra producción desde un agente.
- No aplicar cambios masivos de dependencias ni `ng update` sin aprobación humana.
- No desactivar pruebas, lint, guards ni controles de seguridad para conseguir una compilación.
- No aceptar automáticamente resultados del agente: revisar diff, pruebas y riesgos.

## Comandos habituales

Usa los scripts de `package.json`; estos son los comandos estándar de Angular CLI.

```bash
# Instalar dependencias exactas del lockfile
npm ci          # o npm install si no hay package-lock.json

# Servidor de desarrollo
ng serve        # o npm start

# Compilar
ng build

# Pruebas unitarias una sola vez
ng test --watch=false

# Versiones activas
node -v
ng version
```

## Adaptación requerida por proyecto

Este paquete no conoce automáticamente:
- la versión exacta de Angular y de TypeScript;
- si el proyecto usa componentes standalone o NgModules;
- el framework de pruebas (Karma/Jasmine, Jest u otro);
- la URL base del backend y cómo se configura (`environment*.ts`);
- si hay Docker, CI o lint configurados;
- el mecanismo de autenticación, si existe.

Confirmar esos datos en el código antes de aplicar las skills.
