/**
 * Utilidades de fechas. El backend trabaja con fechas locales sin zona
 * horaria (LocalDate "yyyy-MM-dd" y LocalDateTime "yyyy-MM-ddTHH:mm:ss"),
 * por eso aquí se arman y separan esos textos sin convertir a UTC.
 */

/**
 * Completa con ceros a la izquierda.
 * @param valor Número a formatear.
 * @returns Texto de dos dígitos.
 */
function dosDigitos(valor: number): string {
  return valor.toString().padStart(2, '0');
}

/**
 * Fecha de hoy en formato yyyy-MM-dd (formato de los input type="date").
 * @returns Fecha actual.
 */
export function hoy(): string {
  const ahora = new Date();
  return `${ahora.getFullYear()}-${dosDigitos(ahora.getMonth() + 1)}-${dosDigitos(ahora.getDate())}`;
}

/**
 * Fecha y hora actual en formato yyyy-MM-ddTHH:mm (formato de los input type="datetime-local").
 * @returns Fecha y hora actual.
 */
export function ahora(): string {
  const fecha = new Date();
  return `${hoy()}T${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
}

/**
 * Une una fecha (yyyy-MM-dd) y una hora (HH:mm) en el formato que espera el backend.
 * @param fecha Fecha del input date.
 * @param hora Hora del input time.
 * @returns Texto yyyy-MM-ddTHH:mm:00.
 */
export function unirFechaHora(fecha: string, hora: string): string {
  return `${fecha}T${hora.substring(0, 5)}:00`;
}

/**
 * Convierte el valor de un input datetime-local (yyyy-MM-ddTHH:mm) al formato del backend.
 * @param valor Valor del input.
 * @returns Texto yyyy-MM-ddTHH:mm:00.
 */
export function aFechaHoraBackend(valor: string): string {
  return valor.length === 16 ? `${valor}:00` : valor;
}

/**
 * Toma la parte de fecha (yyyy-MM-dd) de un LocalDateTime del backend.
 * @param fechaHora Texto yyyy-MM-ddTHH:mm:ss.
 * @returns Texto yyyy-MM-dd.
 */
export function soloFecha(fechaHora: string): string {
  return fechaHora.substring(0, 10);
}

/**
 * Toma la parte de hora (HH:mm) de un LocalDateTime del backend.
 * @param fechaHora Texto yyyy-MM-ddTHH:mm:ss.
 * @returns Texto HH:mm.
 */
export function soloHora(fechaHora: string): string {
  return fechaHora.substring(11, 16);
}

/**
 * Convierte un LocalDateTime del backend al formato de input datetime-local.
 * @param fechaHora Texto yyyy-MM-ddTHH:mm:ss.
 * @returns Texto yyyy-MM-ddTHH:mm.
 */
export function aInputFechaHora(fechaHora: string): string {
  return fechaHora.substring(0, 16);
}
