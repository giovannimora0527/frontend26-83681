import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cita } from 'src/app/models/cita';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CitaService {

  // Backend: GET {apiUrlAuth}/tablas/cita  ->  SELECT * FROM clinica.cita
  private api = `tablas`;
  private tabla = `cita`;

  constructor(private readonly backendService: BackendService) {
  }

  getCitas(): Observable<Cita[]> {
    return this.backendService.get<Cita[]>(environment.apiUrlAuth, this.api, this.tabla);
  }

}
