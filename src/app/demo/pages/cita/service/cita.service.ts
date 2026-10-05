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
  private api = `cita`;

  constructor(private backendService: BackendService) {}

  // Las fechas se envian en formato ISO local (yyyy-MM-ddTHH:mm:ss), que es lo que espera LocalDateTime.
  filtrarPorFechas(fechaInicio: string, fechaFinal: string): Observable<Cita[]> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFinal', fechaFinal);
    return this.backendService.get(environment.apiUrlAuth, this.api, "filtrar-by-fechas", params);
  }
}
