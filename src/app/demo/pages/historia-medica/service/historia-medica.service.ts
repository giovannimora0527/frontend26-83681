import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoriaMedica } from 'src/app/models/historia-medica';
import { PaginaRs } from 'src/app/models/pagina';
import { HistoriaMedicaRq, MiRespuestaRS } from 'src/app/models/requests';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Servicio que consume la API de historias clínicas (/historia-medica).
 */
@Injectable({
  providedIn: 'root'
})
export class HistoriaMedicaService {
  /** Recurso del backend. */
  private api = `historia-medica`;

  constructor(private backendService: BackendService) {}

  /**
   * Lista las historias paginadas, filtradas y ordenadas.
   * @param params Página, tamaño, orden y filtros.
   * @returns Página de historias.
   */
  listar(params: HttpParams): Observable<PaginaRs<HistoriaMedica>> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar", params);
  }

  /**
   * Consulta una historia clínica.
   * @param historiaId Id de la historia.
   * @returns Historia encontrada.
   */
  consultar(historiaId: number): Observable<HistoriaMedica> {
    return this.backendService.get(environment.apiUrlAuth, this.api, `${historiaId}`);
  }

  /**
   * Crea una historia clínica (POST /historia-medica).
   * @param rq Datos de la historia.
   * @returns Respuesta con el id creado.
   */
  crear(rq: HistoriaMedicaRq): Observable<MiRespuestaRS> {
    return this.backendService.postRecurso(environment.apiUrlAuth, this.api, rq);
  }

  /**
   * Cierra una historia clínica (PATCH /historia-medica/{id}/cerrar).
   * @param historiaId Id de la historia.
   * @returns Respuesta del backend.
   */
  cerrar(historiaId: number): Observable<MiRespuestaRS> {
    return this.backendService.patch(environment.apiUrlAuth, this.api, `${historiaId}/cerrar`);
  }

  /**
   * Historias clínicas de una mascota (combo del formulario de fórmulas).
   * @param mascotaId Id de la mascota.
   * @returns Historias de la mascota.
   */
  listarPorMascota(mascotaId: number): Observable<HistoriaMedica[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, `mascota/${mascotaId}`);
  }
}
