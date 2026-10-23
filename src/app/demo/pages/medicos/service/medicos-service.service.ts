import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medico } from 'src/app/models/medico';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MedicosServiceService {
  private api = `medico`;

  constructor(private backendService: BackendService) {

  }

  getMedicos(): Observable<Medico[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "all");
  }

  getMedicoPorDocumento(tipoDocumento: string, numeroDocumento: string): Observable<Medico> {
    const params = new HttpParams()
      .set('tipoDocumento', tipoDocumento)
      .set('numeroDocumento', numeroDocumento);
    return this.backendService.get(environment.apiUrlAuth, this.api, "buscar", params);
  }

  getMedicoPorRegistroProfesional(registroProfesional: string): Observable<Medico> {
    const params = new HttpParams().set('registroProfesional', registroProfesional);
    return this.backendService.get(environment.apiUrlAuth, this.api, "buscarPorRegistroProfesional", params);
  }

}
