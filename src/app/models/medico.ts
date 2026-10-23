/**
 * Médico veterinario de la clínica.
 * Refleja la entidad Medico del backend.
 */
export interface Medico {
  /** Identificador único del veterinario. */
  id?: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  /** Registro profesional del veterinario. */
  registroProfesional: string;
  /** Especialización del veterinario. */
  especializacion?: { id: number; nombre?: string };
}
