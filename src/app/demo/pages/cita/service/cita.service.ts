<<<<<<< HEAD
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
=======
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Cita, CitaRq, FiltrosCita } from 'src/app/models/cita';
import { DireccionOrden, Pagina } from 'src/app/models/pagina';
import { Respuesta } from 'src/app/models/respuesta';
import { API_BASE, construirParams } from 'src/app/services/api.util';
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3

/**
 * Cliente HTTP del recurso /cita.
 */
@Injectable({ providedIn: 'root' })
export class CitaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE}/cita`;

<<<<<<< HEAD
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
=======
  /**
   * Listado paginado con filtros y orden (en el servidor).
   *
   * @param filtros   filtros opcionales.
   * @param pagina    página base 0.
   * @param tamanio   registros por página.
   * @param campo     campo de orden.
   * @param direccion asc o desc.
   */
  listar(filtros: FiltrosCita, pagina: number, tamanio: number, campo: string, direccion: DireccionOrden): Observable<Pagina<Cita>> {
    const params = construirParams({ ...filtros, pagina, tamanio, campo, direccion });
    return this.http.get<Pagina<Cita>>(`${this.url}/paginado`, { params });
  }

  /** @param id identificador de la cita. */
  consultar(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.url}/consultar`, { params: construirParams({ id }) });
  }

  /** @param rq datos de la nueva cita. */
  crear(rq: CitaRq): Observable<Respuesta> {
    return this.http.post<Respuesta>(`${this.url}/guardar`, rq);
  }

  /**
   * @param id identificador de la cita.
   * @param rq nuevos datos.
   */
  actualizar(id: number, rq: CitaRq): Observable<Respuesta> {
    return this.http.put<Respuesta>(`${this.url}/actualizar`, { ...rq, id });
  }

  /** @param id identificador de la cita cancelada a reactivar. */
  reactivar(id: number): Observable<Respuesta> {
    return this.http.post<Respuesta>(`${this.url}/reactivar`, null, { params: construirParams({ id }) });
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
  }
}
