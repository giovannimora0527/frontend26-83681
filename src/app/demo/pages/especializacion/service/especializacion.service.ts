import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Especializacion } from 'src/app/models/especializacion';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EspecializacionService {

  // Backend: GET {apiUrlAuth}/tablas/especializacion  ->  SELECT * FROM clinica.especializacion
  private api = `tablas`;
  private tabla = `especializacion`;

  constructor(private readonly backendService: BackendService) {
  }

  getEspecializaciones(): Observable<Especializacion[]> {
    return this.backendService.get<Especializacion[]>(environment.apiUrlAuth, this.api, this.tabla);
  }

}
