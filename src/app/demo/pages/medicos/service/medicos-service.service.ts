import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Medico } from 'src/app/models/medico';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MedicosService {

  // Backend: GET {apiUrlAuth}/tablas/medico  ->  SELECT * FROM clinica.medico
  private api = `tablas`;
  private tabla = `medico`;

  constructor(private readonly backendService: BackendService) {
  }

  getMedicos(): Observable<Medico[]> {
    return this.backendService.get<Medico[]>(environment.apiUrlAuth, this.api, this.tabla);
  }

}
