import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AnotacionRq, MiRespuestaRS } from 'src/app/models/requests';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnotacionHistoriaService {
  private api = `anotacion-historia`;

  constructor(private backendService: BackendService) {}

  // Si la mascota aun no tiene historia medica, el backend la crea antes de guardar la anotacion.
  crearAnotacion(rq: AnotacionRq): Observable<MiRespuestaRS> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "crear", rq);
  }
}
