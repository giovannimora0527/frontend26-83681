import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Mascota } from 'src/app/models/mascota';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/** Conecta la aplicación con las operaciones de mascotas del servidor. */
@Injectable({
  providedIn: 'root'
})
export class MascotaService {
  private api = `mascota`;

  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor(private backendService: BackendService) {
    
  }

  /** Consulta las mascotas. */
  listarMascotas(): Observable<Mascota[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  /** Registra la mascota. */
  crearMascota(mascota: Mascota): Observable<unknown> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", mascota);
  }

  /** Actualiza la mascota. */
  actualizarMascota(mascota: Mascota): Observable<unknown> {
    console.log('Actualizando mascota:', mascota);
    return this.backendService.post(environment.apiUrlAuth, this.api, "actualizar", mascota);
  }

}
