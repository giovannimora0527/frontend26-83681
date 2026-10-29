import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Especializacion } from 'src/app/models/especializacion';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Servicio que consume los endpoints REST del módulo de especializaciones.
 */
@Injectable({
  providedIn: 'root'
})
export class EspecializacionService {
  private readonly api = 'especializacion';

  constructor(private readonly backendService: BackendService) {}

  /** Lista todas las especializaciones registradas. */
  listarEspecializaciones(): Observable<Especializacion[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'listar');
  }

  /** Consulta una especialización por su identificador. */
  buscarEspecializacion(id: number): Observable<Especializacion> {
    const parametros = new HttpParams().set('id', id);
    return this.backendService.get(environment.apiUrlAuth, this.api, 'buscar', parametros);
  }

  /** Registra una nueva especialización. */
  crearEspecializacion(especializacion: Especializacion): Observable<unknown> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'guardar', especializacion);
  }

  /** Actualiza una especialización existente. */
  actualizarEspecializacion(especializacion: Especializacion): Observable<unknown> {
    return this.backendService.put(environment.apiUrlAuth, this.api, 'actualizar', especializacion);
  }
}
