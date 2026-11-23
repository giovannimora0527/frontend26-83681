import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AnotacionHistoria, AnotacionHistoriaRq, FiltrosAnotacion } from 'src/app/models/anotacion-historia';
import { DireccionOrden, Pagina } from 'src/app/models/pagina';
import { Respuesta } from 'src/app/models/respuesta';
import { API_BASE, construirParams } from 'src/app/services/api.util';

/**
 * Cliente HTTP del recurso /anotacion-historia.
 */
@Injectable({ providedIn: 'root' })
export class AnotacionHistoriaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE}/anotacion-historia`;

  /**
   * Histórico paginado de anotaciones de una historia.
   *
   * @param filtros   historia (obligatoria) y filtros opcionales.
   * @param pagina    página base 0.
   * @param tamanio   registros por página.
   * @param direccion asc o desc (por defecto el backend muestra la más reciente primero).
   */
  listar(filtros: FiltrosAnotacion, pagina: number, tamanio: number, direccion: DireccionOrden): Observable<Pagina<AnotacionHistoria>> {
    const params = construirParams({ ...filtros, pagina, tamanio, campo: 'fechaHora', direccion });
    return this.http.get<Pagina<AnotacionHistoria>>(`${this.url}/paginado`, { params });
  }

  /** @param id identificador de la anotación. */
  consultar(id: number): Observable<AnotacionHistoria> {
    return this.http.get<AnotacionHistoria>(`${this.url}/consultar`, { params: construirParams({ id }) });
  }

  /** @param rq datos de la anotación. */
  crear(rq: AnotacionHistoriaRq): Observable<Respuesta> {
    return this.http.post<Respuesta>(`${this.url}/guardar`, rq);
  }
}
