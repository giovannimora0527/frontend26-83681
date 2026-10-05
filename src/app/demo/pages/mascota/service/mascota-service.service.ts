import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Mascota } from 'src/app/models/mascota';
import { MascotaRq, MiRespuestaRS } from 'src/app/models/requests';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MascotaServiceService {
  private api = `mascota`;

  constructor(private backendService: BackendService) {

  }

  getMascotas(): Observable<Mascota[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  crearMascota(rq: MascotaRq): Observable<MiRespuestaRS> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", rq);
  }

  actualizarMascota(rq: MascotaRq): Observable<MiRespuestaRS> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "actualizar", rq);
  }

  eliminarMascota(mascotaId: number): Observable<MiRespuestaRS> {
    return this.backendService.delete(environment.apiUrlAuth, this.api, `eliminar/${mascotaId}`);
  }

}
