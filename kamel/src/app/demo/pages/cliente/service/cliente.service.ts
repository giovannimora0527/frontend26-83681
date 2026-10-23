import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from 'src/app/models/cliente';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private api = `cliente`;

constructor(private backendService: BackendService) {}

  getClientes(): Observable<Cliente[]> {
    return this.backendService.get<Cliente[]>(
      environment.apiUrlAuth,
      this.api,
      'all'
    );
  }

  getClientePorDocumento(numeroDocumento: string): Observable<Cliente> {
    const params = new HttpParams()
      .set('numeroDocumento', numeroDocumento);

    return this.backendService.get<Cliente>(
      environment.apiUrlAuth,
      this.api,
      'cliente-documento',
      params
    );
  }
}
