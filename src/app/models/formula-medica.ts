import { EstadoFormula } from './estados';

/** Fórmula médica con información RESUMIDA, usada en el listado. */
export interface FormulaResumen {
  id: number;
  /** Fecha en que el sistema registró la fórmula (se usa para el orden inicial). */
  fechaCreacion: string;
  /** Fecha de emisión indicada por el veterinario. */
  fechaEmision: string;
  mascotaNombre: string;
  clienteNombre: string;
  medicoNombre: string;
  medicamentoNombre: string;
  estado: EstadoFormula;
}

/** Fórmula médica con TODOS sus datos, usada en el detalle y la edición. */
export interface FormulaDetalle extends FormulaResumen {
  clienteId: number;
  mascotaId: number;
  historiaId: number;
  /** Fecha de la consulta (historia clínica) a la que está asociada. */
  fechaConsulta: string;
  medicoId: number;
  medicamentoId: number;
  dosis: number;
  unidadDosis: string;
  /** Cada cuántas horas se administra. */
  frecuenciaHoras: number;
  duracionDias: number;
  indicaciones: string;
}

/** Datos para crear o editar una fórmula médica. */
export interface FormulaRq {
  clienteId: number;
  mascotaId: number;
  historiaId: number;
  medicoId: number;
  fechaEmision: string;
  medicamentoId: number;
  dosis: number;
  unidadDosis: string;
  frecuenciaHoras: number;
  duracionDias: number;
  indicaciones: string;
}
