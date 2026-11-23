import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Raza } from 'src/app/models/raza';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RazaService {

  // Backend: GET {apiUrlAuth}/tablas/raza  ->  SELECT * FROM clinica.raza
  private api = `tablas`;
  private tabla = `raza`;

  constructor(private readonly backendService: BackendService) {
  }

  getRazas(): Observable<Raza[]> {
    return this.backendService.get<Raza[]>(environment.apiUrlAuth, this.api, this.tabla);
  }

}
