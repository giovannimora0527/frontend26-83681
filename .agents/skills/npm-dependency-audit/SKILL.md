---
name: npm-dependency-audit
description: Auditar package.json, lockfile y dependencias del frontend y su compatibilidad con Angular.
---

# Npm Dependency Audit

## Procedimiento
1. Leer `package.json`, el lockfile, `angular.json` y `tsconfig*.json`.
2. Ejecutar `npm ls`, `npm outdated` y `npm audit` si el entorno lo permite.
3. Identificar dependencias directas y transitivas, versiones duplicadas y rangos abiertos.
4. Verificar que todos los paquetes `@angular/*` compartan versión mayor y que TypeScript, `zone.js` y `rxjs` sean compatibles con ella.
5. Revisar mantenimiento, licencias, vulnerabilidades y compatibilidad con la versión de Angular objetivo.
6. No usar `--force` ni `--legacy-peer-deps` para ocultar conflictos sin documentarlo.
7. Proponer actualizaciones en grupos pequeños y reversibles.

## Salida
Matriz: paquete, versión actual, origen, versión objetivo, compatibilidad demostrada, riesgo, acción y fuente.
