import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CitaMedica } from 'src/app/models/cita-medica';
import { CitaRq } from 'src/app/models/cita-rq';
import { RespuestaRs } from 'src/app/models/respuesta-rs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

// Servicio que consume los endpoints de /cita del backend
@Injectable({
  providedIn: 'root'
})
export class CitaServiceService {
  private api = `cita`;

  constructor(private backendService: BackendService) {

  }

  // GET: todas las citas (el backend las devuelve de la mas reciente a la mas antigua)
  listarCitas(): Observable<CitaMedica[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  // GET: detalle de una cita
  consultarCita(citaId: number): Observable<CitaMedica> {
    const params = new HttpParams().set('citaId', citaId);
    return this.backendService.get(environment.apiUrlAuth, this.api, "consultar", params);
  }

  // GET: citas de una mascota (para los combos de historia clinica y formula)
  listarCitasPorMascota(mascotaId: number): Observable<CitaMedica[]> {
    const params = new HttpParams().set('mascotaId', mascotaId);
    return this.backendService.get(environment.apiUrlAuth, this.api, "por-mascota", params);
  }

  // POST: crear una cita
  crearCita(cita: CitaRq): Observable<RespuestaRs> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "crear", cita);
  }

  // PUT: actualizar una cita
  actualizarCita(cita: CitaRq): Observable<RespuestaRs> {
    return this.backendService.put(environment.apiUrlAuth, this.api, "actualizar", cita);
  }

  // PATCH: reactivar una cita cancelada (operacion explicita)
  reactivarCita(citaId: number): Observable<RespuestaRs> {
    const params = new HttpParams().set('citaId', citaId);
    return this.backendService.patch(environment.apiUrlAuth, this.api, "reactivar", params);
  }

}
