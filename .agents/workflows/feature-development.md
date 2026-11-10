# Flujo: desarrollo de funcionalidad

1. Definir historia, alcance y criterios de aceptación.
2. Activar `frontend-architect` si afecta varios módulos, rutas o contratos.
3. Inspeccionar la implementación actual (`src/app`), `package.json` y pruebas; localizar el módulo de referencia (mascota para paginación, filtros y ordenamiento).
4. Crear plan con archivos probables y riesgos.
5. Implementar con `frontend-developer`; si cambia el consumo de la API, validar con `api-integration-specialist`.
6. Solicitar revisión independiente con `code-reviewer`.
7. Ejecutar pruebas con `qa-engineer`.
8. Ejecutar análisis de seguridad cuando se afecten sesión, datos o HTML dinámico.
9. Revisar diff y documentación.
10. Entregar resumen, rutas de archivos modificados o añadidos, pruebas reales y riesgos pendientes.

**Gate:** no integrar si hay fallos críticos, pruebas no explicadas o cambios de contrato no aprobados.
