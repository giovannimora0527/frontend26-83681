---
name: code-review-quality
description: Realizar revisión técnica de cambios del frontend con foco en defectos, regresiones y mantenibilidad.
---

# Code Review Quality

## Checklist
- Corrección funcional y manejo de casos límite.
- Seguridad: XSS, tokens, exposición de datos y autorización en el servidor.
- Suscripciones sin desuscribir, peticiones duplicadas y rendimiento de plantillas.
- Consumo de la API: solo `get`/`post`, parámetros y formato de fechas conforme al backend.
- Tipos: uso de `any`, `@ts-ignore` y nullability.
- Compatibilidad con la versión de Angular y TypeScript instaladas (confirmar en `package.json`).
- Coherencia con la estructura y los patrones existentes; sin dependencias nuevas injustificadas.
- Pruebas suficientes y deterministas.
- Manejo de errores y estados de carga, vacío y error.
- Complejidad, duplicación y mantenibilidad.

## Salida
Ordenar hallazgos por severidad: crítico, alto, medio, bajo. Cada hallazgo debe indicar archivo/línea, escenario de fallo, impacto y corrección. Distinguir defectos confirmados de sospechas. No editar el código durante una revisión salvo petición expresa.

## Quality gates
- Revisar la configuración de lint (ESLint) y de SonarQube si existen, además de cobertura, duplicación y complejidad.
- Corregir causas raíz; no reducir umbrales ni ampliar exclusiones para ocultar problemas.
- Si una herramienta no está disponible o no se ejecutó, indicarlo.
