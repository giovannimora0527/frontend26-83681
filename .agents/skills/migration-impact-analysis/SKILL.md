---
name: migration-impact-analysis
description: Analizar una actualización de Angular con versiones de origen y destino confirmadas por el proyecto.
---

# Migration Impact Analysis

## Objetivo
Producir un diagnóstico basado en evidencia antes de cambiar código o versiones.

## Inventario obligatorio
- Node, npm y Angular CLI.
- Versiones de `@angular/*`, TypeScript, `zone.js` y `rxjs`.
- Uso de componentes standalone o NgModules, rutas, guards e interceptores.
- Formularios (template-driven o reactivos) y librerías de UI.
- Servicios HTTP y modelos que dependen del contrato del backend.
- Configuración de `angular.json`, `tsconfig*.json`, lint y builders.
- Pruebas (framework, configuración y cobertura).
- Docker, CI/CD y despliegue, si existen.

## Procedimiento
1. Registrar versiones exactas desde `package.json`, el lockfile y `ng version`.
2. Confirmar con el responsable la versión exacta de destino; no asumir la última disponible.
3. Consultar la guía oficial de actualización de Angular correspondiente.
4. Clasificar hallazgos: bloqueante, alto, medio, bajo.
5. Separar cambios mecánicos (schematics) de cambios semánticos o funcionales.
6. Estimar esfuerzo por componente y definir secuencia y rollback.
7. No modificar dependencias durante el diagnóstico salvo solicitud explícita.

## Entregable
Resumen ejecutivo, inventario, matriz de compatibilidad, riesgos, plan, pruebas requeridas y decisiones pendientes.
