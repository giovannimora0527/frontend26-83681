import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AnotacionHistoria } from 'src/app/models/anotacion-historia';
import { AnotacionHistoriaRq } from 'src/app/models/anotacion-historia-rq';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/** Conecta la aplicación con las operaciones de historias clínicas del servidor. */
@Injectable({
  providedIn: 'root'
})
export class AnotacionHistoriaService {
  private api = 'anotacion-historia';

  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor(private readonly backendService: BackendService) { }

  /** Solicita el listado que muestra este módulo. */
  listar(): Observable<AnotacionHistoria[]> {
    return this.backendService.get<AnotacionHistoria[]>(environment.apiUrlAuth, this.api, 'listar');
  }

  /** Registra una anotación en la historia clínica indicada. */
  crearAnotacionHistoria(anotacion: AnotacionHistoriaRq): Observable<AnotacionHistoria> {
    return this.backendService.post<AnotacionHistoria>(environment.apiUrlAuth, this.api, 'crear', anotacion);
  }

  /** Envía los cambios de una anotación clínica existente. */
  actualizarAnotacionHistoria(anotacion: AnotacionHistoriaRq & { id: number }): Observable<AnotacionHistoria> {
    return this.backendService.put<AnotacionHistoria>(environment.apiUrlAuth, this.api, 'actualizar', anotacion);
  }
}
