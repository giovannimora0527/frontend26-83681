import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Medico } from 'src/app/models/medico';
import { MedicoRq } from 'src/app/models/medico-rq';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { HttpParams } from '@angular/common/http';
import { formatDate } from '@angular/common';

/** Conecta la aplicación con las operaciones de veterinarios del servidor. */
@Injectable({
  providedIn: 'root'
})
export class MedicoService {

  private api = `medico`;

  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor(private readonly backendService: BackendService) { }


  /** Solicita el listado que muestra este módulo. */
  listar(): Observable<Medico[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  /** Registra el veterinario. */
  crearMedico(medico: MedicoRq): Observable<unknown> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'crear', medico);
  }

  /** Actualiza el veterinario. */
  actualizarMedico(medico: MedicoRq & { id: number }): Observable<unknown> {
    return this.backendService.put(environment.apiUrlAuth, this.api, 'actualizar', medico);
  }

  /** Solicita los veterinarios disponibles para la fecha indicada. */
  listarMedicosDisponiblesPorFecha(fechaInicio: Date, fechaFin: Date, citaId?: number, mascotaId?: number): Observable<Medico[]> {
    let params = new HttpParams()
      .set('fechaInicio', formatDate(fechaInicio, "yyyy-MM-dd'T'HH:mm:ss", 'en-US'))
      .set('fechaFin', formatDate(fechaFin, "yyyy-MM-dd'T'HH:mm:ss", 'en-US'));
    if (citaId !== undefined) params = params.set('citaId', citaId);
    if (mascotaId !== undefined) params = params.set('mascotaId', mascotaId);
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar-disponibles", params);
  }
}
