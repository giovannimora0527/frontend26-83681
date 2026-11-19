import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Especializacion } from 'src/app/models/especializacion';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/** Conecta la aplicación con las operaciones de especialidades veterinarias del servidor. */
@Injectable({
  providedIn: 'root'
})
export class EspecializacionService {

  private api = `especializacion`;

  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor(private backendService: BackendService) {

  }

  /** Solicita el listado que muestra este módulo. */
  listar(): Observable<Especializacion[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  /** Envía al servidor los datos de una nueva especialidad. */
  crearEspecializacion(especializacion: Especializacion): Observable<Especializacion> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "crear", especializacion);
  }

  /** Envía las modificaciones de una especialidad registrada. */
  actualizarEspecializacion(especializacion: Especializacion): Observable<Especializacion> {
    return this.backendService.put(environment.apiUrlAuth, this.api, "actualizar", especializacion);
  }
}
