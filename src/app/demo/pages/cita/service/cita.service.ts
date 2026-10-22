import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Cita, CitaRq, FiltrosCita } from 'src/app/models/cita';
import { DireccionOrden, Pagina } from 'src/app/models/pagina';
import { Respuesta } from 'src/app/models/respuesta';
import { API_BASE, construirParams } from 'src/app/services/api.util';

/**
 * Cliente HTTP del recurso /cita.
 */
@Injectable({ providedIn: 'root' })
export class CitaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE}/cita`;

  /**
   * Listado paginado con filtros y orden (en el servidor).
   *
   * @param filtros   filtros opcionales.
   * @param pagina    página base 0.
   * @param tamanio   registros por página.
   * @param campo     campo de orden.
   * @param direccion asc o desc.
   */
  listar(filtros: FiltrosCita, pagina: number, tamanio: number, campo: string, direccion: DireccionOrden): Observable<Pagina<Cita>> {
    const params = construirParams({ ...filtros, pagina, tamanio, campo, direccion });
    return this.http.get<Pagina<Cita>>(`${this.url}/paginado`, { params });
  }

  /** @param id identificador de la cita. */
  consultar(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.url}/consultar`, { params: construirParams({ id }) });
  }

  /** @param rq datos de la nueva cita. */
  crear(rq: CitaRq): Observable<Respuesta> {
    return this.http.post<Respuesta>(`${this.url}/guardar`, rq);
  }

  /**
   * @param id identificador de la cita.
   * @param rq nuevos datos.
   */
  actualizar(id: number, rq: CitaRq): Observable<Respuesta> {
    return this.http.put<Respuesta>(`${this.url}/actualizar`, { ...rq, id });
  }

  /** @param id identificador de la cita cancelada a reactivar. */
  reactivar(id: number): Observable<Respuesta> {
    return this.http.post<Respuesta>(`${this.url}/reactivar`, null, { params: construirParams({ id }) });
  }
}
