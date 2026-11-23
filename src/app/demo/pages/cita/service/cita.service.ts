import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cita } from 'src/app/models/cita';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/** Cuerpo de CitaRq en el backend (POST /cita/crear y /cita/actualizar). */
export interface CitaRq {
  id?: number;
  mascotaId: number;
  medicoId: number;
  fechaHora: string;
  motivo: string;
  estado?: string;
  duracionMinutos?: number;
}

/** HorarioMedicoRs / HorarioMedicoRq: franjas semanales de disponibilidad (diaSemana 1 = lunes ... 7 = domingo). */
export interface HorarioMedico {
  id?: number;
  medicoId: number;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  activo?: boolean;
}

export interface Disponibilidad {
  medicoId: number;
  fecha: string;
  duracionMinutos: number;
  horariosDisponibles: string[];
}

/** CerrarConsultaRq: cierra la atención y crea la anotación en la historia clínica. */
export interface CerrarConsultaRq {
  medicoId: number;
  descripcion: string;
  diagnostico: string;
  observaciones: string;
}

export interface ApiMessage {
  status?: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class CitaService {

  private api = `cita`;

  constructor(private backendService: BackendService) { }

  listarCitas(): Observable<Cita[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  listarCitasPorMascota(mascotaId: number): Observable<Cita[]> {
    const params = new HttpParams().set('mascotaId', mascotaId);
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar-por-mascota", params);
  }

  listarCitasRango(fechaInicio: string, fechaFin: string): Observable<Cita[]> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
    return this.backendService.get(environment.apiUrlAuth, this.api, 'listar-rango', params);
  }

  guardarCita(cita: Cita | CitaRq): Observable<ApiMessage> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "crear", cita);
  }

  actualizarCita(cita: Cita | CitaRq): Observable<ApiMessage> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "actualizar", cita);
  }

  listarHorarios(medicoId: number): Observable<HorarioMedico[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'horarios', new HttpParams().set('medicoId', medicoId));
  }

  guardarHorario(horario: HorarioMedico): Observable<HorarioMedico> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'horarios', horario);
  }

  desactivarHorario(id: number): Observable<ApiMessage> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'horarios/' + id + '/desactivar', {});
  }

  consultarDisponibilidad(medicoId: number, fecha: string, duracionMinutos: number): Observable<Disponibilidad> {
    const params = new HttpParams()
      .set('medicoId', medicoId)
      .set('fecha', fecha)
      .set('duracionMinutos', duracionMinutos);
    return this.backendService.get(environment.apiUrlAuth, this.api, 'disponibilidad', params);
  }

  cerrarConsulta(citaId: number, request: CerrarConsultaRq): Observable<unknown> {
    return this.backendService.post(environment.apiUrlAuth, this.api, `${citaId}/cerrar`, request);
  }
}
