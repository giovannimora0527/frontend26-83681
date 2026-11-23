import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente, ClienteRq } from 'src/app/models/cliente';
import { BackendService } from 'src/app/services/backend.service';
import { API_BASE } from 'src/app/services/api.util';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private api = `cliente`;

  constructor(private readonly backendService: BackendService, private readonly http: HttpClient) {
  }

  getClientes(): Observable<Cliente[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

<<<<<<< HEAD
  crear(request: Cliente): Observable<Cliente> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'guardar', request);
  }

  actualizar(request: Cliente): Observable<Cliente> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'actualizar', request);
  }
=======
  /**
   * @param rq datos del cliente nuevo.
   * @returns cliente creado.
   */
  crear(rq: ClienteRq): Observable<Cliente> {
    return this.http.post<Cliente>(`${API_BASE}/${this.api}/guardar`, rq);
  }

  /**
   * @param id identificador del cliente.
   * @param rq nuevos datos.
   * @returns cliente actualizado.
   */
  actualizar(id: number, rq: ClienteRq): Observable<Cliente> {
    return this.http.put<Cliente>(`${API_BASE}/${this.api}/actualizar`, { ...rq, clienteId: id });
  }

>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
}
