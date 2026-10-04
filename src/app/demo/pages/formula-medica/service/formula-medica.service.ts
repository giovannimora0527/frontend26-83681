import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormulaMedica } from 'src/app/models/formula-medica';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FormulaMedicaService {
  private api = `formula-medica`;

  constructor(private backendService: BackendService) {}

  // Lista las formulas ordenadas por fecha de creacion (asc = mas antiguas primero).
  getFormulasOrdenadas(asc: boolean): Observable<FormulaMedica[]> {
    const params = new HttpParams().set('asc', asc);
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar-ordenado", params);
  }
}
