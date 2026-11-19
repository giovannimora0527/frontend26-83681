import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente } from 'src/app/models/cliente';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/** Conecta la aplicación con las operaciones de clientes del servidor. */
@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private api = `cliente`;

  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor(private backendService: BackendService) {

  }

  /** Consulta los clientes. */
  listarClientes(): Observable<Cliente[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }
}
