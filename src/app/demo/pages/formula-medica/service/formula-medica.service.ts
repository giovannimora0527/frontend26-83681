import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DireccionOrden, Pagina } from 'src/app/models/pagina';
import { FiltrosFormula, FormulaMedica, FormulaMedicaRq } from 'src/app/models/formula-medica';
import { Respuesta } from 'src/app/models/respuesta';
import { API_BASE, construirParams } from 'src/app/services/api.util';

/**
 * Cliente HTTP del recurso /formula-medica.
 */
@Injectable({ providedIn: 'root' })
export class FormulaMedicaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE}/formula-medica`;

  /**
   * Listado paginado y resumido de fórmulas (filtros y orden en el servidor).
   *
   * @param filtros   filtros opcionales.
   * @param pagina    página base 0.
   * @param tamanio   registros por página.
   * @param campo     campo de orden.
   * @param direccion asc o desc.
   */
  listar(filtros: FiltrosFormula, pagina: number, tamanio: number, campo: string, direccion: DireccionOrden): Observable<Pagina<FormulaMedica>> {
    const params = construirParams({ ...filtros, pagina, tamanio, campo, direccion });
    return this.http.get<Pagina<FormulaMedica>>(`${this.url}/paginado`, { params });
  }

  /** @param id identificador de la fórmula. */
  consultar(id: number): Observable<FormulaMedica> {
    return this.http.get<FormulaMedica>(`${this.url}/consultar`, { params: construirParams({ id }) });
  }

  /** @param rq datos de la nueva fórmula. */
  crear(rq: FormulaMedicaRq): Observable<Respuesta> {
    return this.http.post<Respuesta>(`${this.url}/guardar`, rq);
  }

  /**
   * @param id identificador de la fórmula.
   * @param rq datos editables.
   */
  actualizar(id: number, rq: FormulaMedicaRq): Observable<Respuesta> {
    return this.http.put<Respuesta>(`${this.url}/actualizar`, { ...rq, id });
  }
}
