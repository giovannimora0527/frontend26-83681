import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Formula } from 'src/app/models/formula';
import { Cita } from 'src/app/models/cita';
import { Medicamento } from 'src/app/models/medicamento';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FormulaService {

  private api = `formula-medica`;

  constructor(private readonly backendService: BackendService) { }

  listar(): Observable<Formula[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  listarCitas(): Observable<Cita[]> {
    return this.backendService.get(environment.apiUrlAuth, "cita", "listar");
  }

  listarMedicamentos(): Observable<Medicamento[]> {
    return this.backendService.get(environment.apiUrlAuth, "medicamento", "listar");
  }

  crearFormula(formula: Formula): Observable<unknown> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", formula);
  }

  descargarPdf(id: number): Observable<Blob> {
    return this.backendService.download(environment.apiUrlAuth, this.api, `${id}.pdf`);
  }

  actualizarFormula(formula: Formula): Observable<unknown> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "actualizar", formula);
  }
}
