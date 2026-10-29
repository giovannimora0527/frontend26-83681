import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cita } from 'src/app/models/cita';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private api = 'cita';

  /** Rango amplio de fechas para listar todas las citas con el endpoint /cita/filtrar. */
  private readonly fechaInicial = '2000-01-01T00:00:00';
  private readonly fechaFinal = '2100-12-31T23:59:59';

  constructor(private readonly backendService: BackendService) {}

  listarCitas(): Observable<Cita[]> {
    const parametros = new HttpParams()
      .set('fechaInicial', this.fechaInicial)
      .set('fechaFinal', this.fechaFinal);
    return this.backendService.get(environment.apiUrlAuth, this.api, 'filtrar', parametros);
  }

  crearCita(cita: Cita): Observable<unknown> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'guardar', cita);
  }

  actualizarCita(cita: Cita): Observable<unknown> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'actualizar', cita);
  }
}
