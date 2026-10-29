import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medicamento } from 'src/app/models/medicamento';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Servicio que consume los endpoints REST del módulo de medicamentos.
 */
@Injectable({
  providedIn: 'root'
})
export class MedicamentoService {
  private readonly api = 'medicamento';

  constructor(private readonly backendService: BackendService) {}

  /** Lista todos los medicamentos registrados. */
  listarMedicamentos(): Observable<Medicamento[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'listar');
  }

  /** Consulta un medicamento por su identificador. */
  buscarMedicamento(id: number): Observable<Medicamento> {
    const parametros = new HttpParams().set('id', id);
    return this.backendService.get(environment.apiUrlAuth, this.api, 'buscar', parametros);
  }

  /** Registra un nuevo medicamento. */
  crearMedicamento(medicamento: Medicamento): Observable<unknown> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'guardar', medicamento);
  }

  /** Actualiza un medicamento existente. */
  actualizarMedicamento(medicamento: Medicamento): Observable<unknown> {
    return this.backendService.put(environment.apiUrlAuth, this.api, 'actualizar', medicamento);
  }
}
