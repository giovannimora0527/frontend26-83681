---
name: angular-frontend-development
description: Crear y mantener componentes, servicios, rutas y plantillas Angular siguiendo la estructura existente del proyecto.
---

# Angular Frontend Development

## Alcance
Componentes (`.ts` + `.html`), servicios, rutas, formularios, guards, interceptores y modelos.

## Procedimiento
1. Inspeccionar `package.json`, `angular.json`, `src/app` y un módulo ya terminado (por ejemplo mascota) antes de escribir.
2. Confirmar si el proyecto usa componentes standalone o NgModules y seguir ese patrón.
3. Mantener los componentes delgados: la plantilla muestra y captura datos; la lógica de negocio y las llamadas HTTP van en servicios.
4. Usar inyección por constructor (o `inject()` solo si el código existente ya lo usa).
5. Formularios: usar el enfoque que ya use el proyecto (template-driven o reactivos); validar en el formulario y mostrar errores claros en la plantilla.
6. Plantillas: usar la sintaxis ya presente (`*ngFor` con `trackBy`, o `@for` con `track`); evitar lógica pesada y llamadas a métodos costosos.
7. Rutas: seguir el archivo de rutas existente; no cambiar rutas ya publicadas sin aprobación.
8. Tipar modelos con las interfaces o clases del proyecto; sin `any` salvo justificación.
9. No introducir librerías de UI ni de estado nuevas si el proyecto no las usa.

## Validación
`ng build` sin errores, revisión manual del flujo con `ng serve` y pruebas si existen.

## Compatibilidad futura
Evitar APIs obsoletas conocidas y verificar cada API contra la versión declarada en `package.json`; no asumir que sigue igual en la siguiente versión mayor.
