---
name: angular-performance-rxjs
description: Evitar fugas de suscripciones y problemas de rendimiento en componentes Angular y flujos RxJS.
---

# Angular Performance & RxJS

## Procedimiento
1. Preferir el `async` pipe; si hay `subscribe` manual, asegurar la desuscripción con el mecanismo que ya use el proyecto (`takeUntil`, `takeUntilDestroyed`, `ngOnDestroy`).
2. Evitar suscripciones anidadas; usar `switchMap`, `mergeMap` o `forkJoin` según el caso.
3. En filtros que disparan peticiones mientras el usuario escribe, usar `debounceTime` y `distinctUntilChanged`.
4. Usar paginación del lado del servidor para listados grandes, copiando el patrón del módulo de mascota.
5. Usar `trackBy` (o `track`) en listados y no llamar a métodos costosos desde la plantilla.
6. Cambiar a `OnPush` o a lazy loading de rutas solo si el proyecto ya los usa o si hay evidencia medida de un problema.
7. No cargar datos innecesarios al iniciar un componente.

## Validación
Revisar con las herramientas de desarrollo del navegador el número de peticiones y la ausencia de suscripciones que sigan activas al salir de la pantalla. No afirmar mejoras sin medirlas.
