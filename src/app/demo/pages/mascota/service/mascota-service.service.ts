import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Mascota } from 'src/app/models/mascota';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/** Conecta la aplicación con las operaciones de mascotas del servidor. */
@Injectable({
  providedIn: 'root'
})
export class MascotaServiceService {
  private api = `mascota`;

  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor(private readonly backendService: BackendService) {

  }

  /** Solicita los registros del catálogo de mascotas. */
  getMascotas(): Observable<Mascota[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

}
