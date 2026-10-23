import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { Cita, CitaRq } from 'src/app/models/cita';
import { Respuesta } from 'src/app/models/respuesta';

/**
 * Servicio de acceso a los endpoints de citas médicas del backend (/cita).
 * Las reglas de negocio críticas (horarios, estados, fechas) las valida el backend.
 */
@Injectable({ providedIn: 'root' })
export class CitaService {

  /** Nombre del recurso en la API. */
  private readonly endpoint = 'cita';

  constructor(private backend: BackendService) { }

  /**
   * Lista todas las citas, de la más reciente a la más antigua.
   * @returns citas con cliente, mascota y veterinario ya resumidos.
   */
  listar(): Observable<Cita[]> {
    return this.backend.get<Cita[]>(environment.apiUrlAuth, this.endpoint, 'listar');
  }

  /**
   * Consulta una cita por su identificador.
   * @param id identificador de la cita.
   * @returns la cita (404 si no existe).
   */
  consultar(id: number): Observable<Cita> {
    return this.backend.get<Cita>(environment.apiUrlAuth, this.endpoint, `${id}`);
  }

  /**
   * Lista las citas de una mascota (se usa para asociar historias clínicas).
   * @param mascotaId identificador de la mascota.
   */
  listarPorMascota(mascotaId: number): Observable<Cita[]> {
    return this.backend.get<Cita[]>(environment.apiUrlAuth, this.endpoint, `mascota/${mascotaId}`);
  }

  /**
   * Registra una nueva cita.
   * @param cita datos de la cita.
   */
  crear(cita: CitaRq): Observable<Respuesta> {
    return this.backend.post<Respuesta>(environment.apiUrlAuth, this.endpoint, 'crear', cita);
  }

  /**
   * Edita una cita existente (PUT). El backend limita qué se puede cambiar según su estado.
   * @param id identificador de la cita.
   * @param cita datos nuevos de la cita.
   */
  editar(id: number, cita: CitaRq): Observable<Respuesta> {
    return this.backend.put<Respuesta>(environment.apiUrlAuth, this.endpoint, `${id}`, cita);
  }

  /**
   * Reactiva una cita cancelada (operación explícita; vuelve a estado PENDIENTE).
   * @param id identificador de la cita.
   */
  reactivar(id: number): Observable<Respuesta> {
    return this.backend.patch<Respuesta>(environment.apiUrlAuth, this.endpoint, `${id}/reactivar`);
  }
}
