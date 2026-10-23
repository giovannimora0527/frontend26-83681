import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnotacionHistoria } from 'src/app/models/anotacion-historia';
import { PaginaRs } from 'src/app/models/pagina';
import { AnotacionHistoriaRq, MiRespuestaRS } from 'src/app/models/requests';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Servicio que consume la API de anotaciones (/anotacion-historia).
 */
@Injectable({
  providedIn: 'root'
})
export class AnotacionHistoriaService {
  /** Recurso del backend. */
  private api = `anotacion-historia`;

  constructor(private backendService: BackendService) {}

  /**
   * Agrega una anotación a una historia clínica (POST /anotacion-historia).
   * @param rq Datos de la anotación.
   * @returns Respuesta con el id creado.
   */
  crear(rq: AnotacionHistoriaRq): Observable<MiRespuestaRS> {
    return this.backendService.postRecurso(environment.apiUrlAuth, this.api, rq);
  }

  /**
   * Anotaciones de una historia clínica, paginadas.
   * @param historiaId Id de la historia.
   * @param params Página, tamaño, orden y filtros.
   * @returns Página de anotaciones.
   */
  listarPorHistoria(historiaId: number, params: HttpParams): Observable<PaginaRs<AnotacionHistoria>> {
    return this.backendService.get(environment.apiUrlAuth, this.api, `historia/${historiaId}`, params);
  }

  /**
   * Histórico completo de anotaciones de una mascota, paginado.
   * @param mascotaId Id de la mascota.
   * @param params Página, tamaño, orden y filtros.
   * @returns Página de anotaciones.
   */
  listarPorMascota(mascotaId: number, params: HttpParams): Observable<PaginaRs<AnotacionHistoria>> {
    return this.backendService.get(environment.apiUrlAuth, this.api, `mascota/${mascotaId}`, params);
  }
}
