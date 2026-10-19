import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { AnotacionHistoria } from 'src/app/models/anotacion-historia';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnotacionHistoriaService {
  private api = 'anotacion-historia';

  constructor(private readonly backendService: BackendService) {}

  listarAnotaciones(): Observable<AnotacionHistoria[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'listar-anotaciones');
  }

  listarAnotacionesPorHistoria(historiaId: number): Observable<AnotacionHistoria[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, `listar/${historiaId}`);
  }

  crearAnotacion(solicitud: AnotacionHistoria): Observable<unknown> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'crear', solicitud);
  }
}