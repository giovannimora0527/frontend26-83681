import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Especializacion } from 'src/app/models/especializacion';
import { EspecializacionRq, MiRespuestaRS } from 'src/app/models/requests';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EspecializacionService {
  private api = `especializacion`;

  constructor(private backendService: BackendService) {}

  getEspecializaciones(): Observable<Especializacion[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  crearEspecializacion(rq: EspecializacionRq): Observable<MiRespuestaRS> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", rq);
  }

  actualizarEspecializacion(rq: EspecializacionRq): Observable<MiRespuestaRS> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "actualizar", rq);
  }

  eliminarEspecializacion(id: number): Observable<MiRespuestaRS> {
    return this.backendService.delete(environment.apiUrlAuth, this.api, `eliminar/${id}`);
  }
}
