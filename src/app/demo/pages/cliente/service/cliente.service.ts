import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente } from 'src/app/models/cliente';
import { ClienteRq, MiRespuestaRS } from 'src/app/models/requests';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private api = `cliente`;

  constructor(private backendService: BackendService) {}

  getClientes(): Observable<Cliente[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "all");
  }

  crearCliente(rq: ClienteRq): Observable<MiRespuestaRS> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", rq);
  }

  actualizarCliente(rq: ClienteRq): Observable<MiRespuestaRS> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "actualizar", rq);
  }

  eliminarCliente(id: number): Observable<MiRespuestaRS> {
    return this.backendService.delete(environment.apiUrlAuth, this.api, `eliminar/${id}`);
  }
}
