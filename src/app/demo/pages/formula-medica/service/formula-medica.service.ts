import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormulaMedica, FormulaMedicaResumen } from 'src/app/models/formula-medica';
import { PaginaRs } from 'src/app/models/pagina';
import { FormulaMedicaRq, MiRespuestaRS } from 'src/app/models/requests';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Servicio que consume la API de fórmulas médicas (/formula-medica).
 */
@Injectable({
  providedIn: 'root'
})
export class FormulaMedicaService {
  /** Recurso del backend. */
  private api = `formula-medica`;

  constructor(private backendService: BackendService) {}

  /**
   * Lista las fórmulas (vista resumida) paginadas, filtradas y ordenadas.
   * @param params Página, tamaño, orden y filtros.
   * @returns Página de fórmulas resumidas.
   */
  listar(params: HttpParams): Observable<PaginaRs<FormulaMedicaResumen>> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar", params);
  }

  /**
   * Consulta el detalle completo de una fórmula.
   * @param formulaId Id de la fórmula.
   * @returns Fórmula completa.
   */
  consultar(formulaId: number): Observable<FormulaMedica> {
    return this.backendService.get(environment.apiUrlAuth, this.api, `${formulaId}`);
  }

  /**
   * Crea una fórmula (POST /formula-medica).
   * @param rq Datos de la fórmula.
   * @returns Respuesta con el id creado.
   */
  crear(rq: FormulaMedicaRq): Observable<MiRespuestaRS> {
    return this.backendService.postRecurso(environment.apiUrlAuth, this.api, rq);
  }

  /**
   * Edita una fórmula (PUT /formula-medica/{id}).
   * @param formulaId Id de la fórmula.
   * @param rq Nuevos datos.
   * @returns Respuesta del backend.
   */
  editar(formulaId: number, rq: FormulaMedicaRq): Observable<MiRespuestaRS> {
    return this.backendService.put(environment.apiUrlAuth, this.api, `${formulaId}`, rq);
  }

  /**
   * Inactiva una fórmula (PATCH /formula-medica/{id}/inactivar).
   * @param formulaId Id de la fórmula.
   * @returns Respuesta del backend.
   */
  inactivar(formulaId: number): Observable<MiRespuestaRS> {
    return this.backendService.patch(environment.apiUrlAuth, this.api, `${formulaId}/inactivar`);
  }
}
