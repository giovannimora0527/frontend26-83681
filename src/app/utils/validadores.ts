import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ahora, hoy, unirFechaHora } from './fecha.util';

/**
 * Valida que un campo de texto no esté compuesto solo por espacios.
 * @param control Control a validar.
 * @returns Error "espacios" si el texto está en blanco.
 */
export function noSoloEspacios(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  return typeof valor === 'string' && valor.length > 0 && valor.trim().length === 0 ? { espacios: true } : null;
}

/**
 * Validador de grupo: la fecha y hora (dos controles separados) no puede ser
 * anterior al momento actual. Se usa al agendar citas.
 * @param campoFecha Nombre del control con la fecha (yyyy-MM-dd).
 * @param campoHora Nombre del control con la hora (HH:mm).
 * @param fechaPermitida Función opcional que retorna una fecha y hora que se
 * acepta aunque ya haya pasado (al editar, la fecha original de la cita si no se cambia).
 * @returns Validador que marca el error "fechaPasada" en el grupo.
 */
export function fechaHoraNoPasada(campoFecha: string, campoHora: string,
  fechaPermitida?: () => string | null): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const fecha = grupo.get(campoFecha)?.value;
    const hora = grupo.get(campoHora)?.value;
    if (!fecha || !hora) {
      return null;
    }
    const valor = unirFechaHora(fecha, hora).substring(0, 16);
    if (fechaPermitida && fechaPermitida()?.substring(0, 16) === valor) {
      return null;
    }
    return valor < ahora() ? { fechaPasada: true } : null;
  };
}

/**
 * La fecha (input date) no puede ser posterior a hoy.
 * @param control Control a validar.
 * @returns Error "fechaFutura" si la fecha es mayor que hoy.
 */
export function fechaNoFutura(control: AbstractControl): ValidationErrors | null {
  return control.value && control.value > hoy() ? { fechaFutura: true } : null;
}

/**
 * La fecha y hora (input datetime-local) no puede ser posterior al momento actual.
 * @param control Control a validar.
 * @returns Error "fechaFutura" si la fecha es mayor que ahora.
 */
export function fechaHoraNoFutura(control: AbstractControl): ValidationErrors | null {
  return control.value && control.value > ahora() ? { fechaFutura: true } : null;
}

/**
 * Valida que un número tenga como máximo la cantidad de decimales indicada.
 * @param decimales Cantidad máxima de decimales.
 * @returns Validador que marca el error "decimales".
 */
export function maximoDecimales(decimales: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    if (valor === null || valor === undefined || valor === '') {
      return null;
    }
    const partes = String(valor).split('.');
    return partes.length > 1 && partes[1].length > decimales ? { decimales: true } : null;
  };
}
