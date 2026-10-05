import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Mascota } from 'src/app/models/mascota';
import { MascotaRq, MiRespuestaRS } from 'src/app/models/requests';
import { BackendService } from 'src/app/services/backend.service';
import { MockDataService } from 'src/app/services/mock-data.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MascotaServiceService {
  private api = `mascota`;

  constructor(private readonly backendService: BackendService,
    private readonly mock: MockDataService) {

  }

  getMascotas(): Observable<Mascota[]> {
    if (environment.useMock) {
      return this.mock.listar<Mascota>('mascotas');
    }
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  guardarMascota(mascota: Mascota): Observable<MiRespuestaRS> {
    if (environment.useMock) {
      return this.mock.guardar('mascotas', mascota, 'mascotaId', 'fechaRegistro');
    }
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", this.toRq(mascota));
  }

  actualizarMascota(mascota: Mascota): Observable<MiRespuestaRS> {
    if (environment.useMock) {
      return this.mock.actualizar('mascotas', mascota, 'mascotaId', 'fechaModificacion');
    }
    return this.backendService.post(environment.apiUrlAuth, this.api, "actualizar", this.toRq(mascota));
  }

  private toRq(mascota: Mascota): MascotaRq {
    return {
      mascotaId: mascota.mascotaId,
      nombreMascota: mascota.nombreMascota ?? '',
      edad: mascota.edad ?? 0,
      razaId: mascota.raza?.razaId ?? 0,
      clienteId: mascota.cliente?.clienteId ?? 0
    };
  }

}
