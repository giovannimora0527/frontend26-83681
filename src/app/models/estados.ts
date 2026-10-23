/** Estados que puede tener una cita médica. */
export const ESTADOS_CITA = ['PENDIENTE', 'CONFIRMADA', 'PROGRAMADA', 'ATENDIDA', 'CANCELADA'] as const;
/** Tipo de un estado de cita. */
export type EstadoCita = (typeof ESTADOS_CITA)[number];

/** Estados con los que se puede CREAR una cita (una cita nueva no nace atendida ni cancelada). */
export const ESTADOS_CITA_NUEVA: EstadoCita[] = ['PENDIENTE', 'CONFIRMADA', 'PROGRAMADA'];

/** Estados de una historia clínica. */
export const ESTADOS_HISTORIA = ['ABIERTA', 'CERRADA'] as const;
export type EstadoHistoria = (typeof ESTADOS_HISTORIA)[number];

/** Estados de una fórmula médica (no se elimina físicamente: se inactiva). */
export const ESTADOS_FORMULA = ['ACTIVA', 'INACTIVA'] as const;
export type EstadoFormula = (typeof ESTADOS_FORMULA)[number];

/** Unidades de medida permitidas para la dosis de un medicamento. */
export const UNIDADES_DOSIS = ['mg', 'g', 'ml', 'gotas', 'tabletas', 'UI'] as const;

/** Clase de Bootstrap para pintar la insignia de cada estado. */
export const CLASES_ESTADO: Record<string, string> = {
  PENDIENTE: 'bg-warning text-dark',
  CONFIRMADA: 'bg-info text-dark',
  PROGRAMADA: 'bg-primary',
  ATENDIDA: 'bg-success',
  CANCELADA: 'bg-danger',
  ABIERTA: 'bg-success',
  CERRADA: 'bg-secondary',
  ACTIVA: 'bg-success',
  INACTIVA: 'bg-secondary'
};
