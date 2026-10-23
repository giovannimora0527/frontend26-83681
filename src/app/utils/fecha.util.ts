/**
 * Utilidades para convertir fechas entre los inputs HTML y el backend (LocalDateTime ISO, sin zona horaria).
 */

/** Rellena con cero a la izquierda hasta tener 2 dígitos. */
const dos = (n: number): string => String(n).padStart(2, '0');

/** Devuelve la fecha de hoy (hora local) en formato yyyy-MM-dd. */
export function hoyLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

/** Devuelve el momento actual (hora local) en formato yyyy-MM-ddTHH:mm, compatible con datetime-local. */
export function ahoraLocalInput(): string {
  const d = new Date();
  return `${hoyLocal()}T${dos(d.getHours())}:${dos(d.getMinutes())}`;
}

/** Recorta un LocalDateTime del backend (yyyy-MM-ddTHH:mm:ss) a yyyy-MM-ddTHH:mm para un datetime-local. */
export function aInputFechaHora(iso?: string | null): string {
  return iso ? iso.substring(0, 16) : '';
}

/** Extrae la fecha (yyyy-MM-dd) de un LocalDateTime. */
export function soloFecha(iso?: string | null): string {
  return iso ? iso.substring(0, 10) : '';
}

/** Extrae la hora (HH:mm) de un LocalDateTime. */
export function soloHora(iso?: string | null): string {
  return iso ? iso.substring(11, 16) : '';
}

/** Une una fecha (yyyy-MM-dd) y una hora (HH:mm) en un LocalDateTime (yyyy-MM-ddTHH:mm:00). */
export function unirFechaHora(fecha: string, hora: string): string {
  return `${fecha}T${hora.substring(0, 5)}:00`;
}

/** Convierte el valor de un datetime-local (yyyy-MM-ddTHH:mm) en LocalDateTime (con segundos). */
export function aLocalDateTime(valor: string): string {
  return valor.length === 16 ? `${valor}:00` : valor;
}

/** Formatea un LocalDateTime como dd/MM/yyyy HH:mm para mostrarlo al usuario. */
export function formatearFechaHora(iso?: string | null): string {
  if (!iso) {
    return '';
  }
  const [fecha, hora] = iso.split('T');
  const [a, m, d] = fecha.split('-');
  return `${d}/${m}/${a} ${(hora ?? '').substring(0, 5)}`.trim();
}
