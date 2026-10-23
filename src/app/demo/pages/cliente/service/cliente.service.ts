import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { Cliente } from 'src/app/models/cliente';

export type { Cliente };

/**
 * Servicio de acceso a los endpoints de clientes del backend (/cliente).
 */
@Injectable({ providedIn: 'root' })
export class ClienteService {

  /** Nombre del recurso en la API. */
  private readonly endpoint = 'cliente';

  constructor(private backend: BackendService) { }

  /**
   * Lista todos los clientes registrados.
   * @returns clientes de la clínica.
   */
  listar(): Observable<Cliente[]> {
    return this.backend.get<Cliente[]>(environment.apiUrlAuth, this.endpoint, 'all');
  }

  /**
   * Consulta un cliente por su identificador.
   * @param id identificador del cliente.
   * @returns el cliente encontrado (404 si no existe).
   */
  consultar(id: number): Observable<Cliente> {
    return this.backend.get<Cliente>(environment.apiUrlAuth, this.endpoint, `${id}`);
  }

  /**
   * Registra un nuevo cliente.
   * @param cliente datos del cliente.
   */
  guardar(cliente: Cliente): Observable<any> {
    return this.backend.post(environment.apiUrlAuth, this.endpoint, 'guardar', cliente);
  }

  /**
   * Actualiza un cliente existente.
   * @param cliente datos del cliente (con id).
   */
  actualizar(cliente: Cliente): Observable<any> {
    return this.backend.post(environment.apiUrlAuth, this.endpoint, 'actualizar', cliente);
  }
}
