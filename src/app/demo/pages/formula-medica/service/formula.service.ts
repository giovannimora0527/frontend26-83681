import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Formula } from 'src/app/models/formula';
import { Cita } from 'src/app/models/cita';
import { Medicamento } from 'src/app/models/medicamento';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/** Conecta la aplicación con las operaciones de fórmulas médicas del servidor. */
@Injectable({
  providedIn: 'root'
})
export class FormulaService {

  private api = `formula-medica`;

  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor(private readonly backendService: BackendService) { }

  /** Solicita el listado que muestra este módulo. */
  listar(): Observable<Formula[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  /** Consulta las citas. */
  listarCitas(): Observable<Cita[]> {
    return this.backendService.get(environment.apiUrlAuth, "cita", "listar");
  }

  /** Consulta los medicamentos. */
  listarMedicamentos(): Observable<Medicamento[]> {
    return this.backendService.get(environment.apiUrlAuth, "medicamento", "listar");
  }

  /** Registra la fórmula médica. */
  crearFormula(formula: Formula): Observable<unknown> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", formula);
  }

  /** Actualiza la fórmula médica. */
  actualizarFormula(formula: Formula): Observable<unknown> {
    console.log('Actualizando formula:', formula);
    return this.backendService.post(environment.apiUrlAuth, this.api, "actualizar", formula);
  }
}
