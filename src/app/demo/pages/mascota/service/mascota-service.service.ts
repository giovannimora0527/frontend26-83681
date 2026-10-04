import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mascota } from 'src/app/models/mascota';
import { MascotaRq } from 'src/app/models/mascota-rq';
import { RespuestaRs } from 'src/app/models/respuesta-rs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MascotaServiceService {
  private api = `mascota`;

  constructor(private backendService: BackendService) {

  }

  getMascotas(): Observable<Mascota[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  getMascotaPorNombre(nombre: string): Observable<Mascota> {
    const params = new HttpParams().set('nombre', nombre);
    return this.backendService.get(environment.apiUrlAuth, this.api, "buscar", params);
  }

  guardarMascota(mascota: MascotaRq): Observable<RespuestaRs> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", mascota);
  }

  actualizarMascota(mascota: MascotaRq): Observable<RespuestaRs> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "actualizar", mascota);
  }

}
