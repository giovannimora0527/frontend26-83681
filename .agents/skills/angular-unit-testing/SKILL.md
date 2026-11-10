---
name: angular-unit-testing
description: Crear pruebas unitarias de componentes, servicios y pipes Angular con resultados reproducibles.
---

# Angular Unit Testing

## Procedimiento
1. Confirmar el framework de pruebas en `package.json` y en la configuración (`karma.conf.js`, `jest.config.*` o `angular.json`); usar el que ya existe.
2. Identificar el comportamiento observable y los criterios de aceptación.
3. Servicios: usar `TestBed` y `HttpTestingController` para verificar método (`get`/`post`), URL, parámetros, cuerpo y errores.
4. Componentes: probar renderizado, eventos del usuario, estados de carga, vacío y error, con servicios simulados.
5. Cubrir escenarios positivos, negativos, límites y regresiones.
6. Evitar esperas con `setTimeout`; usar `fakeAsync` o `waitForAsync`.
7. No simular el objeto bajo prueba ni probar detalles privados.
8. Reportar cobertura como dato, no como sustituto de calidad.

## Validación
Ejecutar pruebas focalizadas y luego `ng test --watch=false` (o el script `test` de `package.json`) y `ng build` cuando el entorno lo permita. Informar exactamente qué se ejecutó.
