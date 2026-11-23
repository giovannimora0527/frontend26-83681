<<<<<<< HEAD
import { Medico } from './medico';
import { Historia } from './historia';
import { Cita } from './cita';
import { Formula } from './formula';

export class AnotacionHistoria {
    id!: number;
    descripcion!: string;
    diagnostico?: string | null;
    observaciones?: string | null;
    fecha!: Date | string;
    historia!: Historia;
    medico!: Medico;
    cita?: Cita | null;
    formulasMedicas?: Formula[] | null;
=======
// Recurso: /anotacion-historia — tabla anotacion_historia.

/** Anotación de historia clínica con el veterinario resuelto. */
export interface AnotacionHistoria {
  id: number;
  historiaId: number;
  medicoId: number;
  medicoNombre?: string;
  fechaHora: string;
  descripcion: string;
  observacion: string;
  diagnosticoEvolucion: string;
}

/** Datos para registrar una anotación. */
export interface AnotacionHistoriaRq {
  historiaId: number;
  medicoId: number;
  fechaHora?: string | null;
  descripcion: string;
  observacion: string;
  diagnosticoEvolucion: string;
}

/** Filtros del histórico de anotaciones de una historia. */
export interface FiltrosAnotacion {
  historiaId: number;
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  texto?: string | null;
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
}
