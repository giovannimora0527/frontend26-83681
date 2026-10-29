import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Raza } from 'src/app/models/raza';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Servicio que consume los endpoints REST del módulo de razas.
 */
@Injectable({
  providedIn: 'root'
})
export class RazaService {
  private readonly api = 'raza';

  constructor(private readonly backendService: BackendService) {}

  /** Lista todas las razas registradas. */
  listarRazas(): Observable<Raza[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'listar');
  }

  /** Consulta una raza por su identificador. */
  buscarRaza(razaId: number): Observable<Raza> {
    const parametros = new HttpParams().set('razaId', razaId);
    return this.backendService.get(environment.apiUrlAuth, this.api, 'buscar', parametros);
  }

  /** Registra una nueva raza. */
  crearRaza(raza: Raza): Observable<unknown> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'guardar', raza);
  }

  /** Actualiza una raza existente. */
  actualizarRaza(raza: Raza): Observable<unknown> {
    return this.backendService.put(environment.apiUrlAuth, this.api, 'actualizar', raza);
  }
}
