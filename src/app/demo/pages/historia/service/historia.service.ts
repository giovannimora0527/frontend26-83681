import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Historia } from 'src/app/models/historia';
import { HistoriaMedica } from 'src/app/models/historia-medica';
import { HistoriaRq } from 'src/app/models/historia-rq';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/** Conecta la aplicación con las operaciones de historias clínicas del servidor. */
@Injectable({
  providedIn: 'root'
})
export class HistoriaService {
  private api = 'historia-clinica';

  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor(private readonly backendService: BackendService) { }

  /** Solicita el listado que muestra este módulo. */
  listar(): Observable<HistoriaMedica[]> {
    return this.backendService.get<HistoriaMedica[]>(environment.apiUrlAuth, this.api, 'listar');
  }

  /** Registra la historia clínica. */
  crearHistoria(historia: HistoriaRq): Observable<Historia> {
    return this.backendService.post<Historia>(environment.apiUrlAuth, this.api, 'guardar', historia);
  }

  /** Actualiza la historia clínica. */
  actualizarHistoria(historia: HistoriaRq & { id: number }): Observable<Historia> {
    return this.backendService.put<Historia>(environment.apiUrlAuth, this.api, 'actualizar', historia);
  }
}
