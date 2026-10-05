import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Especializacion } from 'src/app/models/especializacion';
import { EspecializacionRq, MiRespuestaRS } from 'src/app/models/requests';
import { BackendService } from 'src/app/services/backend.service';
import { MockDataService } from 'src/app/services/mock-data.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EspecializacionService {
  private api = `especializacion`;

  constructor(private readonly backendService: BackendService,
    private readonly mock: MockDataService) {
  }

  getEspecializaciones(): Observable<Especializacion[]> {
    if (environment.useMock) {
      return this.mock.listar<Especializacion>('especializaciones');
    }
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  guardarEspecializacion(especializacion: Especializacion): Observable<MiRespuestaRS> {
    if (environment.useMock) {
      return this.mock.guardar('especializaciones', especializacion, 'id');
    }
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", this.toRq(especializacion));
  }

  actualizarEspecializacion(especializacion: Especializacion): Observable<MiRespuestaRS> {
    if (environment.useMock) {
      return this.mock.actualizar('especializaciones', especializacion, 'id');
    }
    return this.backendService.post(environment.apiUrlAuth, this.api, "actualizar", this.toRq(especializacion));
  }

  private toRq(especializacion: Especializacion): EspecializacionRq {
    return {
      id: especializacion.id,
      nombre: especializacion.nombre ?? '',
      descripcion: especializacion.descripcion || null,
      codigoEspecializacion: especializacion.codigoEspecializacion ?? ''
    };
  }
}
