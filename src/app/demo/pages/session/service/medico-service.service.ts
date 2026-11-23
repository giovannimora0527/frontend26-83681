import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FiltrosHistoria, HistoriaMedica, HistoriaMedicaRq } from 'src/app/models/historia-medica';
import { DireccionOrden, Pagina } from 'src/app/models/pagina';
import { Respuesta } from 'src/app/models/respuesta';
import { API_BASE, construirParams } from 'src/app/services/api.util';

<<<<<<< HEAD:src/app/demo/pages/medico/service/medico-service.service.ts
@Injectable({
  providedIn: 'root'
})
export class MedicoServiceService {
=======
/**
 * Cliente HTTP del recurso /historia.
 */
@Injectable({ providedIn: 'root' })
export class HistoriaMedicaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE}/historia`;
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3:src/app/demo/pages/historia-medica/service/historia-medica.service.ts

  /**
   * Listado paginado de historias clínicas.
   *
   * @param filtros   filtros opcionales.
   * @param pagina    página base 0.
   * @param tamanio   registros por página.
   * @param campo     campo de orden.
   * @param direccion asc o desc.
   */
  listar(filtros: FiltrosHistoria, pagina: number, tamanio: number, campo: string, direccion: DireccionOrden): Observable<Pagina<HistoriaMedica>> {
    const params = construirParams({ ...filtros, pagina, tamanio, campo, direccion });
    return this.http.get<Pagina<HistoriaMedica>>(`${this.url}/paginado`, { params });
  }

  /** @param id identificador de la historia. */
  consultar(id: number): Observable<HistoriaMedica> {
    return this.http.get<HistoriaMedica>(`${this.url}/consultar`, { params: construirParams({ id }) });
  }

  /** @param rq cita atendida y datos clínicos. */
  crear(rq: HistoriaMedicaRq): Observable<Respuesta> {
    return this.http.post<Respuesta>(`${this.url}/guardar`, rq);
  }
}
