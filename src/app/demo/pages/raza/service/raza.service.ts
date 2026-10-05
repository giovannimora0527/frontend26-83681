import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Raza } from 'src/app/models/raza';
import { MiRespuestaRS, RazaRq } from 'src/app/models/requests';
import { BackendService } from 'src/app/services/backend.service';
import { MockDataService } from 'src/app/services/mock-data.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RazaService {
  private api = `raza`;

  constructor(private readonly backendService: BackendService,
    private readonly mock: MockDataService) {
  }

  getRazas(): Observable<Raza[]> {
    if (environment.useMock) {
      return this.mock.listar<Raza>('razas');
    }
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  guardarRaza(raza: Raza): Observable<MiRespuestaRS> {
    if (environment.useMock) {
      return this.mock.guardar('razas', raza, 'razaId', 'fechaCreacion');
    }
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", this.toRq(raza));
  }

  actualizarRaza(raza: Raza): Observable<MiRespuestaRS> {
    if (environment.useMock) {
      return this.mock.actualizar('razas', raza, 'razaId', 'fechaModificacion');
    }
    return this.backendService.post(environment.apiUrlAuth, this.api, "actualizar", this.toRq(raza));
  }

  private toRq(raza: Raza): RazaRq {
    return { razaId: raza.razaId, nombre: raza.nombre ?? '', especie: raza.especie ?? '' };
  }
}
