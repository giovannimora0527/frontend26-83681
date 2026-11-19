import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Medicamento } from 'src/app/models/medicamento';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/** Conecta la aplicación con las operaciones de medicamentos y productos del servidor. */
@Injectable({
  providedIn: 'root'
})
export class MedicamentoService {

  private api = `medicamento`;

  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor(private backendService: BackendService) {

  }

  /** Consulta los medicamentos. */
  listarMedicamentos(): Observable<Medicamento[]> {
    // Consume el resumen plano: el endpoint /listar serializa relaciones de lotes y movimientos recursivas.
    return this.backendService.get(environment.apiUrlAuth, this.api, 'disponibilidad');
  }
}
