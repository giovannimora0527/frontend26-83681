/**
 * Funciones para manejar fechas en el formato que entienden los inputs de HTML
 * y el backend (LocalDateTime de Java: yyyy-MM-ddTHH:mm:ss).
 */

/** Agrega un cero a la izquierda (5 -> "05"). */
function dosDigitos(valor: number): string {
  return valor.toString().padStart(2, '0');
}

/** Fecha de hoy en formato yyyy-MM-dd (para el atributo min de un input date). */
export function hoy(): string {
  const d = new Date();
  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`;
}

/** Fecha y hora actual en formato yyyy-MM-ddTHH:mm (para un input datetime-local). */
export function ahora(): string {
  const d = new Date();
  return `${hoy()}T${dosDigitos(d.getHours())}:${dosDigitos(d.getMinutes())}`;
}

/**
 * Une una fecha (yyyy-MM-dd) y una hora (HH:mm) en el formato del backend.
 * Ejemplo: ("2026-12-01", "10:30") -> "2026-12-01T10:30:00"
 */
export function unirFechaHora(fecha: string, hora: string): string {
  return `${fecha}T${hora}:00`;
}

/**
 * Separa una fecha del backend en fecha y hora para los inputs.
 * Ejemplo: "2026-12-01T10:30:00" -> { fecha: "2026-12-01", hora: "10:30" }
 */
export function separarFechaHora(fechaHora?: string): { fecha: string; hora: string } {
  if (!fechaHora) {
    return { fecha: '', hora: '' };
  }
  return { fecha: fechaHora.substring(0, 10), hora: fechaHora.substring(11, 16) };
}

/**
 * Convierte el valor de un input datetime-local (yyyy-MM-ddTHH:mm) al
 * formato del backend agregando los segundos.
 */
export function aFormatoBackend(fechaHoraLocal: string): string {
  return fechaHoraLocal.length === 16 ? `${fechaHoraLocal}:00` : fechaHoraLocal;
}

/**
 * Indica si una fecha ISO esta dentro de un rango (los extremos vacios no filtran).
 * @param fechaIso fecha del registro (yyyy-MM-ddTHH:mm:ss).
 * @param desde fecha inicial yyyy-MM-dd (inclusive).
 * @param hasta fecha final yyyy-MM-dd (inclusive).
 */
export function estaEnRango(fechaIso: string | undefined, desde: string, hasta: string): boolean {
  const fecha = (fechaIso ?? '').substring(0, 10);
  return (!desde || fecha >= desde) && (!hasta || fecha <= hasta);
}
