import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cita } from 'src/app/models/cita';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private api = 'cita';

  constructor(private readonly backendService: BackendService) {}

  listarCitas(): Observable<Cita[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'listar');
  }

  crearCita(cita: Cita): Observable<unknown> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'crear', cita);
  }

  actualizarCita(cita: Cita): Observable<unknown> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'actualizar', cita);
  }
}
