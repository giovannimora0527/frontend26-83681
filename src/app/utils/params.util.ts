import { HttpParams } from '@angular/common/http';

/**
 * Construye los query params de una petición omitiendo los valores vacíos
 * (null, undefined o texto en blanco), para que el backend solo aplique los
 * filtros que el usuario diligenció.
 * @param valores Objeto con los parámetros.
 * @returns Parámetros listos para HttpClient.
 */
export function construirParams(valores: Record<string, unknown>): HttpParams {
  let params = new HttpParams();
  Object.entries(valores).forEach(([clave, valor]) => {
    if (valor === null || valor === undefined) {
      return;
    }
    const texto = String(valor).trim();
    if (texto !== '') {
      params = params.set(clave, texto);
    }
  });
  return params;
}
