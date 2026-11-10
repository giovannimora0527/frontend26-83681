---
name: angular-architecture-design
description: Definir y proteger la estructura de carpetas, los límites entre módulos y las dependencias del frontend Angular.
---

# Angular Architecture Design

## Procedimiento
1. Mapear la estructura real de `src/app`: módulos o componentes por funcionalidad, servicios, modelos y rutas.
2. Identificar el patrón dominante (por ejemplo una carpeta por entidad como mascota, cliente o cita) y seguirlo en lo nuevo.
3. Mantener la dirección de dependencias: componentes → servicios → modelos; un módulo de funcionalidad no importa componentes de otro.
4. Colocar lo compartido (modelos comunes, interceptores, utilidades) en la carpeta compartida que el proyecto ya tenga.
5. Los servicios que mantienen datos o llaman a la API son únicos y no guardan estado mutable compartido sin necesidad.
6. Proponer opciones con ventajas, costos y riesgos antes de mover carpetas; no refactorizar de forma masiva sin autorización.
7. Registrar decisiones y criterios de aceptación.

## No hacer
No introducir capas, librerías de estado ni patrones nuevos que el proyecto no use.
