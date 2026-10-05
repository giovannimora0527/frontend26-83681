import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AnotacionHistoria } from 'src/app/models/anotacion-historia';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnotacionHistoriaService {

  // Backend: GET {apiUrlAuth}/tablas/anotacion_historia  ->  SELECT * FROM clinica.anotacion_historia
  private api = `tablas`;
  private tabla = `anotacion_historia`;

  constructor(private readonly backendService: BackendService) {
  }

  getAnotacionesHistoria(): Observable<AnotacionHistoria[]> {
    return this.backendService.get<AnotacionHistoria[]>(environment.apiUrlAuth, this.api, this.tabla);
  }

}
