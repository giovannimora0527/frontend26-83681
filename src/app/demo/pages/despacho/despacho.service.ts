import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { ConfirmarDespachoRq, DespachoRs, FormulaPendiente } from 'src/app/models/despacho';

@Injectable({ providedIn: 'root' })
export class DespachoService {
  constructor(private readonly backend: BackendService) {}
  pendientes(params?: HttpParams): Observable<FormulaPendiente[]> {
    return this.backend.getPath(environment.apiUrlAuth, 'despacho/formulas/pendientes', params);
  }
  confirmar(request: ConfirmarDespachoRq): Observable<DespachoRs> {
    return this.backend.postPath(environment.apiUrlAuth, 'despacho/confirmar', request);
  }
  historial(params?: HttpParams): Observable<unknown[]> {
    return this.backend.getPath(environment.apiUrlAuth, 'despacho/historial', params);
  }
}
