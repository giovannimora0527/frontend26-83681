import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from 'src/app/models/cliente';
import { RespuestaRs } from 'src/app/models/respuesta-rs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClienteServiceService {
  private api = `cliente`;

  constructor(private backendService: BackendService) {

  }

  getClientes(): Observable<Cliente[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "all");
  }

  getClientePorDocumento(numeroDocumento: string): Observable<Cliente> {
    const params = new HttpParams().set('numeroDocumento', numeroDocumento);
    return this.backendService.get(environment.apiUrlAuth, this.api, "cliente-documento", params);
  }

  guardarCliente(cliente: Cliente): Observable<RespuestaRs> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", cliente);
  }

  actualizarCliente(cliente: Cliente): Observable<RespuestaRs> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "actualizar", cliente);
  }

}
