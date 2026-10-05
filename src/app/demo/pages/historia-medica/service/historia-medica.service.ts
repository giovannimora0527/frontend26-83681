import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AnotacionHistoria } from 'src/app/models/anotacion-historia';
import { HistoriaMedica } from 'src/app/models/historia-medica';
import { Mascota } from 'src/app/models/mascota';
import { Medico } from 'src/app/models/medico';
import { AnotacionRq, MiRespuestaRS } from 'src/app/models/requests';
import { BackendService } from 'src/app/services/backend.service';
import { MockDataService } from 'src/app/services/mock-data.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistoriaMedicaService {
  private api = `historia-medica`;
  private apiAnotacion = `anotacion-historia`;

  constructor(private readonly backendService: BackendService,
    private readonly mock: MockDataService) {
  }

  getHistorias(): Observable<HistoriaMedica[]> {
    if (environment.useMock) {
      return this.mock.listar<HistoriaMedica>('historias');
    }
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  getAnotaciones(historiaId: number): Observable<AnotacionHistoria[]> {
    if (environment.useMock) {
      return this.mock.listar<AnotacionHistoria>('anotaciones').pipe(
        map((anotaciones) => anotaciones.filter((anotacion) => anotacion.historia?.id === historiaId))
      );
    }
    return this.backendService.get(environment.apiUrlAuth, this.apiAnotacion, `listar-por-historia/${historiaId}`);
  }

  /**
   * Agrega una anotacion a la historia de la mascota.
   * Si la mascota aun no tiene historia, se crea (igual que hace el backend con AnotacionRq).
   */
  crearAnotacion(rq: AnotacionRq): Observable<MiRespuestaRS> {
    if (environment.useMock) {
      const mascota = this.mock.buscar<Mascota>('mascotas', (m) => m.mascotaId === rq.mascotaId);
      const medico = this.mock.buscar<Medico>('medicos', (m) => m.id === rq.medicoId);
      const historia =
        this.mock.buscar<HistoriaMedica>('historias', (h) => h.mascota?.mascotaId === rq.mascotaId) ??
        this.mock.insertar<HistoriaMedica>('historias', { mascota }, 'id', 'fechaCreacion');
      this.mock.insertar<AnotacionHistoria>('anotaciones', { historia, medico, descripcion: rq.descripcion }, 'id', 'fecha');
      return this.mock.responder('Anotación registrada correctamente');
    }
    return this.backendService.post(environment.apiUrlAuth, this.apiAnotacion, "crear", rq);
  }
}
