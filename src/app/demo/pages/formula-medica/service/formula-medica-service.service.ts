import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormulaMedica } from 'src/app/models/formula-medica';
import { FormulaMedicaRq } from 'src/app/models/formula-medica-rq';
import { RespuestaRs } from 'src/app/models/respuesta-rs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

// Servicio que consume los endpoints de /formula-medica del backend
@Injectable({
  providedIn: 'root'
})
export class FormulaMedicaServiceService {
  private api = `formula-medica`;

  constructor(private backendService: BackendService) {

  }

  // GET: todas las formulas (de la mas reciente a la mas antigua)
  listarFormulas(): Observable<FormulaMedica[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  // GET: detalle completo de una formula
  consultarFormula(formulaId: number): Observable<FormulaMedica> {
    const params = new HttpParams().set('formulaId', formulaId);
    return this.backendService.get(environment.apiUrlAuth, this.api, "consultar", params);
  }

  // POST: crear una formula
  crearFormula(formula: FormulaMedicaRq): Observable<RespuestaRs> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "crear", formula);
  }

  // PUT: actualizar los datos editables de una formula
  actualizarFormula(formula: FormulaMedicaRq): Observable<RespuestaRs> {
    return this.backendService.put(environment.apiUrlAuth, this.api, "actualizar", formula);
  }

  // PATCH: inactivar una formula (no se borra fisicamente)
  inactivarFormula(formulaId: number): Observable<RespuestaRs> {
    const params = new HttpParams().set('formulaId', formulaId);
    return this.backendService.patch(environment.apiUrlAuth, this.api, "inactivar", params);
  }

}
