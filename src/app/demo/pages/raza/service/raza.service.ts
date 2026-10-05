import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Raza } from 'src/app/models/raza';
import { RazaRq, MiRespuestaRS } from 'src/app/models/requests';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RazaService {
  private api = `raza`;

  constructor(private backendService: BackendService) {}

  getRazas(): Observable<Raza[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  crearRaza(rq: RazaRq): Observable<MiRespuestaRS> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", rq);
  }

  actualizarRaza(rq: RazaRq): Observable<MiRespuestaRS> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "actualizar", rq);
  }

  eliminarRaza(id: number): Observable<MiRespuestaRS> {
    return this.backendService.delete(environment.apiUrlAuth, this.api, `eliminar/${id}`);
  }
}
