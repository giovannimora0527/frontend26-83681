import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { FormulaDetalle, FormulaResumen, FormulaRq } from 'src/app/models/formula-medica';
import { Respuesta } from 'src/app/models/respuesta';

/**
 * Servicio de acceso a los endpoints de fórmulas médicas del backend (/formula-medica).
 * El listado devuelve información resumida; el detalle devuelve todos los campos.
 */
@Injectable({ providedIn: 'root' })
export class FormulaMedicaService {

  /** Nombre del recurso en la API. */
  private readonly endpoint = 'formula-medica';

  constructor(private backend: BackendService) { }

  /**
   * Lista las fórmulas (resumen), de la más reciente a la más antigua por fecha de creación.
   */
  listar(): Observable<FormulaResumen[]> {
    return this.backend.get<FormulaResumen[]>(environment.apiUrlAuth, this.endpoint, 'listar');
  }

  /**
   * Consulta el detalle completo de una fórmula.
   * @param id identificador de la fórmula.
   * @returns la fórmula (404 si no existe).
   */
  consultar(id: number): Observable<FormulaDetalle> {
    return this.backend.get<FormulaDetalle>(environment.apiUrlAuth, this.endpoint, `${id}`);
  }

  /**
   * Registra una nueva fórmula médica.
   * @param formula datos de la fórmula.
   */
  crear(formula: FormulaRq): Observable<Respuesta> {
    return this.backend.post<Respuesta>(environment.apiUrlAuth, this.endpoint, 'crear', formula);
  }

  /**
   * Edita una fórmula existente (PUT).
   * @param id identificador de la fórmula.
   * @param formula datos nuevos.
   */
  editar(id: number, formula: FormulaRq): Observable<Respuesta> {
    return this.backend.put<Respuesta>(environment.apiUrlAuth, this.endpoint, `${id}`, formula);
  }

  /**
   * Inactiva una fórmula (no se elimina físicamente porque está asociada a información clínica).
   * @param id identificador de la fórmula.
   */
  inactivar(id: number): Observable<Respuesta> {
    return this.backend.patch<Respuesta>(environment.apiUrlAuth, this.endpoint, `${id}/inactivar`);
  }
}
