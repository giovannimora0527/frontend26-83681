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
  private readonly api = 'formula-medica';

  constructor(private readonly backendService: BackendService) {}

  /** Consulta las fórmulas médicas, de la más reciente a la más antigua. */
  getFormulas(): Observable<FormulaMedica[]> {
    const params = new HttpParams().set('asc', 'false');
    return this.backendService.get<FormulaMedica[]>(
      environment.apiUrlAuth, this.api, 'listar-ordenado', params
    );
  }

  /** Crea una fórmula médica. */
  crearFormula(datos: {
    citaId: number;
    medicamentoId: number;
    dosis: string;
    indicaciones?: string;
  }): Observable<FormulaMedica> {
    return this.backendService.post<FormulaMedica>(
      environment.apiUrlAuth, this.api, '', datos
    );
  }
}
