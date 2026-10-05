import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente } from 'src/app/models/cliente';
import { ClienteRq, MiRespuestaRS } from 'src/app/models/requests';
import { BackendService } from 'src/app/services/backend.service';
import { MockDataService } from 'src/app/services/mock-data.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private api = `cliente`;

  constructor(private readonly backendService: BackendService,
    private readonly mock: MockDataService) {
  }

  getClientes(): Observable<Cliente[]> {
    if (environment.useMock) {
      return this.mock.listar<Cliente>('clientes');
    }
    return this.backendService.get(environment.apiUrlAuth, this.api, "all");
  }

  guardarCliente(cliente: Cliente): Observable<MiRespuestaRS> {
    if (environment.useMock) {
      return this.mock.guardar('clientes', cliente, 'clienteId');
    }
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", this.toRq(cliente));
  }

  actualizarCliente(cliente: Cliente): Observable<MiRespuestaRS> {
    if (environment.useMock) {
      return this.mock.actualizar('clientes', cliente, 'clienteId');
    }
    return this.backendService.post(environment.apiUrlAuth, this.api, "actualizar", this.toRq(cliente));
  }

  private toRq(cliente: Cliente): ClienteRq {
    return {
      id: cliente.clienteId,
      tipoDocumento: cliente.tipoDocumento ?? '',
      numeroDocumento: cliente.numeroDocumento ?? '',
      nombres: cliente.nombres ?? '',
      apellidos: cliente.apellidos ?? '',
      fechaNacimiento: cliente.fechaNacimiento || null,
      genero: cliente.genero || null,
      telefono: cliente.telefono || null,
      direccion: cliente.direccion || null,
      activo: cliente.activo
    };
  }

}
