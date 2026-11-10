---
name: angular-version-migration
description: Ejecutar una actualización de versión de Angular de forma gradual, solo con versión destino aprobada.
---

# Angular Version Migration

## Procedimiento
1. Partir de un diagnóstico de `migration-impact-analysis` y de una versión destino aprobada.
2. Trabajar con el repositorio limpio y en una rama separada; confirmar que `ng build` y las pruebas pasan antes de empezar.
3. Actualizar una versión mayor a la vez con `ng update`, siguiendo la guía oficial de esa versión; no saltar versiones mayores.
4. Revisar los requisitos de Node y TypeScript de la versión destino.
5. Aplicar primero los cambios mecánicos de los schematics y revisar el diff.
6. Corregir cambios semánticos (APIs eliminadas, cambios de comportamiento) de forma individual.
7. Ejecutar `ng build` y pruebas después de cada salto de versión.
8. Documentar el rollback.

## Advertencia
Actualizar la versión no implica convertir el proyecto a standalone, signals ni a la nueva sintaxis de plantillas: esos cambios solo se hacen con aprobación y de forma separada.
