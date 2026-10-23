/**
 * Cliente (dueño de las mascotas) registrado en la clínica.
 * Refleja la entidad Cliente del backend.
 */
export interface Cliente {
  /** Identificador único del cliente. */
  id?: number;
  /** Tipo de documento (CC, CE, TI...). */
  tipoDocumento: string;
  /** Número de documento del cliente. */
  numeroDocumento: string;
  /** Nombres del cliente. */
  nombres: string;
  /** Apellidos del cliente. */
  apellidos: string;
  /** Fecha de nacimiento (yyyy-MM-dd). */
  fechaNacimiento?: string;
  /** Género del cliente. */
  genero?: string;
  /** Teléfono de contacto. */
  telefono?: string;
  /** Dirección de residencia. */
  direccion?: string;
  /** Indica si el cliente está activo. */
  activo?: boolean;
}
