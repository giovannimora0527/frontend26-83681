import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { FormulaMedica } from 'src/app/models/formula-medica';
import { MiRespuestaRS } from 'src/app/models/requests';
import { BackendService } from 'src/app/services/backend.service';
import { MockDataService } from 'src/app/services/mock-data.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FormulaMedicaService {
  private api = `formula-medica`;

  constructor(private readonly backendService: BackendService,
    private readonly mock: MockDataService) {
  }

  // Lista las formulas ordenadas por fecha de creacion (asc = mas antiguas primero).
  getFormulasOrdenadas(asc: boolean): Observable<FormulaMedica[]> {
    if (environment.useMock) {
      return this.mock.listar<FormulaMedica>('formulas').pipe(
        map((formulas) => formulas.sort((a, b) => {
          const orden = (a.fechaCreacionRegistro ?? '').localeCompare(b.fechaCreacionRegistro ?? '');
          return asc ? orden : -orden;
        }))
      );
    }
    const params = new HttpParams().set('asc', asc);
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar-ordenado", params);
  }

  guardarFormula(formula: FormulaMedica): Observable<MiRespuestaRS> {
    if (environment.useMock) {
      return this.mock.guardar('formulas', formula, 'id', 'fechaCreacionRegistro');
    }
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", formula);
  }

  actualizarFormula(formula: FormulaMedica): Observable<MiRespuestaRS> {
    if (environment.useMock) {
      return this.mock.actualizar('formulas', formula, 'id', 'fechaActualizacionRegistro');
    }
    return this.backendService.post(environment.apiUrlAuth, this.api, "actualizar", formula);
  }
}
