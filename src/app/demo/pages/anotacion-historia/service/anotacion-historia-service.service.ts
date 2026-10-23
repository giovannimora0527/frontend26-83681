import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnotacionHistoria } from 'src/app/models/anotacion-historia';
import { AnotacionRq } from 'src/app/models/anotacion-rq';
import { RespuestaRs } from 'src/app/models/respuesta-rs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

// Servicio que consume los endpoints de /anotacion-historia del backend
@Injectable({
  providedIn: 'root'
})
export class AnotacionHistoriaServiceService {
  private api = `anotacion-historia`;

  constructor(private backendService: BackendService) {

  }

  // POST: agregar una anotacion a una historia clinica abierta
  crearAnotacion(anotacion: AnotacionRq): Observable<RespuestaRs> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "crear", anotacion);
  }

  // GET: anotaciones de una historia clinica (de la mas reciente a la mas antigua)
  listarPorHistoria(historiaId: number): Observable<AnotacionHistoria[]> {
    const params = new HttpParams().set('historiaId', historiaId);
    return this.backendService.get(environment.apiUrlAuth, this.api, "por-historia", params);
  }

  // GET: historial completo de anotaciones de una mascota
  listarPorMascota(mascotaId: number): Observable<AnotacionHistoria[]> {
    const params = new HttpParams().set('mascotaId', mascotaId);
    return this.backendService.get(environment.apiUrlAuth, this.api, "por-mascota", params);
  }

}
