import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FormulaMedica } from 'src/app/models/formula-medica';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FormulaMedicaService {

  // Backend: GET {apiUrlAuth}/tablas/formula_medica  ->  SELECT * FROM clinica.formula_medica
  private api = `tablas`;
  private tabla = `formula_medica`;

  constructor(private readonly backendService: BackendService) {
  }

  getFormulasMedicas(): Observable<FormulaMedica[]> {
    return this.backendService.get<FormulaMedica[]>(environment.apiUrlAuth, this.api, this.tabla);
  }

}
