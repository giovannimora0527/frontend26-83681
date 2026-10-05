import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HistoriaMedica } from 'src/app/models/historia-medica';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistoriaMedicaService {

  // Backend: GET {apiUrlAuth}/tablas/historia_medica  ->  SELECT * FROM clinica.historia_medica
  private api = `tablas`;
  private tabla = `historia_medica`;

  constructor(private readonly backendService: BackendService) {
  }

  getHistoriasMedicas(): Observable<HistoriaMedica[]> {
    return this.backendService.get<HistoriaMedica[]>(environment.apiUrlAuth, this.api, this.tabla);
  }

}
