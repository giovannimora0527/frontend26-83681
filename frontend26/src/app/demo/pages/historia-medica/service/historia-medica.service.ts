import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { HistoriaMedica } from 'src/app/models/historia-medica'; 
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistoriaMedicaService {
  private api = 'historia-medica';

  /** Rango amplio de fechas para listar todas las historias con el endpoint /historia-medica/listar. */
  private readonly fechaInicial = '2000-01-01T00:00:00';
  private readonly fechaFinal = '2100-12-31T23:59:59';

  constructor(private readonly backendService: BackendService) {}

  listarHistorias(): Observable<HistoriaMedica[]> {
    const parametros = new HttpParams()
      .set('fechaInicial', this.fechaInicial)
      .set('fechaFinal', this.fechaFinal);
    return this.backendService.get<HistoriaMedica[]>(environment.apiUrlAuth, this.api, 'listar', parametros).pipe(
      // El backend entrega la mascota en la propiedad "paciente"; la pantalla la usa como "mascota".
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map((historias) => historias.map((historia: any) => ({ ...historia, mascota: historia.paciente })))
    );
  }

  crearHistoria(solicitud: HistoriaMedica): Observable<unknown> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'guardar', {
      ...solicitud,
      // El backend identifica a la mascota como "pacienteId".
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pacienteId: (solicitud as any).mascotaId
    });
  }
}