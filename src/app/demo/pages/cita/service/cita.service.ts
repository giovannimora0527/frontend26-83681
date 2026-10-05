import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Cita } from 'src/app/models/cita';
import { MiRespuestaRS } from 'src/app/models/requests';
import { BackendService } from 'src/app/services/backend.service';
import { MockDataService } from 'src/app/services/mock-data.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private api = `cita`;

  constructor(private readonly backendService: BackendService,
    private readonly mock: MockDataService) {
  }

  // Las fechas se envian en formato ISO local (yyyy-MM-ddTHH:mm:ss), que es lo que espera LocalDateTime.
  filtrarPorFechas(fechaInicio: string, fechaFinal: string): Observable<Cita[]> {
    if (environment.useMock) {
      return this.mock.listar<Cita>('citas').pipe(
        map((citas) => citas.filter((cita) => (cita.fechaHora ?? '') >= fechaInicio && (cita.fechaHora ?? '') <= fechaFinal))
      );
    }
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFinal', fechaFinal);
    return this.backendService.get(environment.apiUrlAuth, this.api, "filtrar-by-fechas", params);
  }

  guardarCita(cita: Cita): Observable<MiRespuestaRS> {
    if (environment.useMock) {
      return this.mock.guardar('citas', cita, 'id');
    }
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", cita);
  }

  actualizarCita(cita: Cita): Observable<MiRespuestaRS> {
    if (environment.useMock) {
      return this.mock.actualizar('citas', cita, 'id');
    }
    return this.backendService.post(environment.apiUrlAuth, this.api, "actualizar", cita);
  }
}
