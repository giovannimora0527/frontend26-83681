---
applyTo: "**/*.spec.ts"
---
- Mantener las pruebas deterministas y aisladas.
- Usar el framework de pruebas ya presente en el proyecto (confirmar en `package.json`).
- Usar `TestBed` y `HttpTestingController` para componentes y servicios con HTTP.
- No mockear el objeto bajo prueba ni verificar detalles internos irrelevantes.
- Incluir escenarios positivos, negativos y de error HTTP.
- No usar datos reales ni secretos.
