import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cita } from 'src/app/models/cita';
import { PaginaRs } from 'src/app/models/pagina';
import { CitaRq, MiRespuestaRS } from 'src/app/models/requests';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Servicio que consume la API de citas (/cita).
 */
@Injectable({
  providedIn: 'root'
})
export class CitaService {
  /** Recurso del backend. */
  private api = `cita`;

  constructor(private backendService: BackendService) {}

  /**
   * Lista las citas paginadas, filtradas y ordenadas (GET /cita/listar).
   * @param params Página, tamaño, orden y filtros.
   * @returns Página de citas.
   */
  listar(params: HttpParams): Observable<PaginaRs<Cita>> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar", params);
  }

  /**
   * Consulta una cita (GET /cita/{id}).
   * @param citaId Id de la cita.
   * @returns Cita encontrada.
   */
  consultar(citaId: number): Observable<Cita> {
    return this.backendService.get(environment.apiUrlAuth, this.api, `${citaId}`);
  }

  /**
   * Crea una cita (POST /cita).
   * @param rq Datos de la cita.
   * @returns Respuesta con el id creado.
   */
  crear(rq: CitaRq): Observable<MiRespuestaRS> {
    return this.backendService.postRecurso(environment.apiUrlAuth, this.api, rq);
  }

  /**
   * Edita una cita (PUT /cita/{id}).
   * @param citaId Id de la cita.
   * @param rq Nuevos datos.
   * @returns Respuesta del backend.
   */
  editar(citaId: number, rq: CitaRq): Observable<MiRespuestaRS> {
    return this.backendService.put(environment.apiUrlAuth, this.api, `${citaId}`, rq);
  }

  /**
   * Cambia el estado de una cita (PATCH /cita/{id}/estado).
   * @param citaId Id de la cita.
   * @param estado Nuevo estado.
   * @returns Respuesta del backend.
   */
  cambiarEstado(citaId: number, estado: string): Observable<MiRespuestaRS> {
    return this.backendService.patch(environment.apiUrlAuth, this.api, `${citaId}/estado`, { estado });
  }

  /**
   * Reactiva una cita cancelada (PATCH /cita/{id}/reactivar).
   * @param citaId Id de la cita.
   * @param fechaCita Nueva fecha y hora (yyyy-MM-ddTHH:mm:ss).
   * @returns Respuesta del backend.
   */
  reactivar(citaId: number, fechaCita: string): Observable<MiRespuestaRS> {
    return this.backendService.patch(environment.apiUrlAuth, this.api, `${citaId}/reactivar`, { fechaCita });
  }

  /**
   * Citas atendidas de una mascota que aún no tienen historia clínica.
   * @param mascotaId Id de la mascota.
   * @returns Citas disponibles para generar historia.
   */
  atendidasSinHistoria(mascotaId: number): Observable<Cita[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, `mascota/${mascotaId}/atendidas-sin-historia`);
  }
}
