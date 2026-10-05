import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Medico } from 'src/app/models/medico';
import { MedicoRq, MiRespuestaRS } from 'src/app/models/requests';
import { BackendService } from 'src/app/services/backend.service';
import { MockDataService } from 'src/app/services/mock-data.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MedicosServiceService {
  private api = `medico`;

  constructor(private readonly backendService: BackendService,
    private readonly mock: MockDataService) {
  }

  getMedicos(): Observable<Medico[]> {
    if (environment.useMock) {
      return this.mock.listar<Medico>('medicos');
    }
    return this.backendService.get(environment.apiUrlAuth, this.api, "all");
  }

  guardarMedico(medico: Medico): Observable<MiRespuestaRS> {
    if (environment.useMock) {
      return this.mock.guardar('medicos', medico, 'id');
    }
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", this.toRq(medico));
  }

  actualizarMedico(medico: Medico): Observable<MiRespuestaRS> {
    if (environment.useMock) {
      return this.mock.actualizar('medicos', medico, 'id');
    }
    return this.backendService.post(environment.apiUrlAuth, this.api, "actualizar", this.toRq(medico));
  }

  private toRq(medico: Medico): MedicoRq {
    return {
      id: medico.id,
      tipoDocumento: medico.tipoDocumento ?? '',
      numeroDocumento: medico.numeroDocumento ?? '',
      nombres: medico.nombres ?? '',
      apellidos: medico.apellidos ?? '',
      telefono: medico.telefono || null,
      registroProfesional: medico.registroProfesional ?? '',
      especializacionId: medico.especializacion?.id ?? 0
    };
  }
}
