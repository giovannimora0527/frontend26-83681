
/**
 * Representa una fórmula médica registrada en el sistema.
 * Los campos opcionales permiten manejar registros
 * devueltos por la API con propiedades no informadas.
 */
export class FormulaMedica {
  id?: number;

  citaId?: number;
  cita_id?: number;

  medicamentoId?: number;
  medicamento_id?: number;

  dosis?: string;
  indicaciones?: string;

  fechaCreacionRegistro?: string | Date;
  fecha_creacion_registro?: string | Date;

  fechaActualizacionRegistro?: string | Date;
  fecha_actualizacion_registro?: string | Date;
}