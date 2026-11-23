import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Mascota } from 'src/app/models/mascota';
import { BackendService } from 'src/app/services/backend.service';
import { API_BASE } from 'src/app/services/api.util';
import { environment } from 'src/environments/environment';

/** Datos que el backend espera para guardar o actualizar una mascota. */
export interface MascotaRq {
  mascotaId?: number;
  nombre: string;
  edad: number;
  razaId: number;
  clienteId: number;
}

/** Respuesta del backend al guardar o actualizar. */
export interface RespuestaMascota {
  status: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class MascotaServiceService {
  private api = `mascota`;

  constructor(private readonly backendService: BackendService, private readonly http: HttpClient) {

  }

  getMascotas(): Observable<Mascota[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  /** @param rq datos de la mascota nueva. */
  crear(rq: MascotaRq): Observable<RespuestaMascota> {
    return this.http.post<RespuestaMascota>(`${API_BASE}/${this.api}/guardar`, rq);
  }

  /** @param rq datos de la mascota, incluido mascotaId. */
  actualizar(rq: MascotaRq): Observable<RespuestaMascota> {
    return this.http.put<RespuestaMascota>(`${API_BASE}/${this.api}/actualizar`, rq);
  }

}
