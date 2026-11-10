---
name: typescript-best-practices
description: Aplicar buenas prácticas de TypeScript en el código Angular y revisar compatibilidad con la versión instalada.
---

# TypeScript Best Practices

## Alcance
Código TypeScript de producción y pruebas del frontend Angular.

## Procedimiento
1. Confirmar la versión de TypeScript y las opciones de `tsconfig*.json` (por ejemplo `strict`).
2. Inspeccionar convenciones locales y librerías disponibles.
3. Tipar parámetros, retornos y respuestas HTTP con interfaces o clases del proyecto; preferir `unknown` antes que `any`.
4. Usar `const`, `readonly`, uniones de tipos y encadenamiento opcional donde aclaren el código.
5. Seguir la convención de nombres de Angular: archivos en kebab-case, clases en PascalCase, sufijos `.component`, `.service`, `.model`.
6. Mantener funciones cortas y cohesivas; evitar abstracciones innecesarias.
7. Manejar `null` y `undefined` de forma explícita; no silenciar errores de tipo con `@ts-ignore`.
8. Usar el estilo asíncrono que ya usa el proyecto (Observables o promesas); no mezclarlos sin motivo.

## Validación
- Compilar con `ng build`.
- Ejecutar pruebas.
- Revisar nullability, errores de tipo y compatibilidad de dependencias.

## No hacer
No activar opciones `strict` de golpe en un proyecto existente; no convertir automáticamente clases en interfaces; no usar sintaxis de versiones posteriores a la instalada.
