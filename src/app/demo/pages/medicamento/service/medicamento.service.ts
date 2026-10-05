import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Medicamento } from 'src/app/models/medicamento';
import { MedicamentoRq, MiRespuestaRS } from 'src/app/models/requests';
import { BackendService } from 'src/app/services/backend.service';
import { MockDataService } from 'src/app/services/mock-data.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MedicamentoService {
  private api = `medicamento`;

  constructor(private readonly backendService: BackendService,
    private readonly mock: MockDataService) {
  }

  getMedicamentos(): Observable<Medicamento[]> {
    if (environment.useMock) {
      return this.mock.listar<Medicamento>('medicamentos');
    }
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  guardarMedicamento(medicamento: Medicamento): Observable<MiRespuestaRS> {
    if (environment.useMock) {
      return this.mock.guardar('medicamentos', medicamento, 'id', 'fechaCreacion');
    }
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", this.toRq(medicamento));
  }

  actualizarMedicamento(medicamento: Medicamento): Observable<MiRespuestaRS> {
    if (environment.useMock) {
      return this.mock.actualizar('medicamentos', medicamento, 'id', 'fechaModificacion');
    }
    return this.backendService.post(environment.apiUrlAuth, this.api, "actualizar", this.toRq(medicamento));
  }

  private toRq(medicamento: Medicamento): MedicamentoRq {
    return {
      id: medicamento.id,
      nombre: medicamento.nombre ?? '',
      presentacion: medicamento.presentacion ?? '',
      descripcion: medicamento.descripcion || null
    };
  }
}
