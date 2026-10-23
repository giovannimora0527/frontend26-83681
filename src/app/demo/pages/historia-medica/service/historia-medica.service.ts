import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { Anotacion, AnotacionRq, HistoriaMedica, HistoriaMedicaRq } from 'src/app/models/historia-medica';
import { Respuesta } from 'src/app/models/respuesta';

/**
 * Servicio de acceso a los endpoints de historias clínicas y sus anotaciones (/historia-medica).
 */
@Injectable({ providedIn: 'root' })
export class HistoriaMedicaService {

  /** Nombre del recurso en la API. */
  private readonly endpoint = 'historia-medica';

  constructor(private backend: BackendService) { }

  /**
   * Lista las historias clínicas, de la consulta más reciente a la más antigua.
   * @returns historias con mascota, cliente y veterinario ya resumidos.
   */
  listar(): Observable<HistoriaMedica[]> {
    return this.backend.get<HistoriaMedica[]>(environment.apiUrlAuth, this.endpoint, 'listar');
  }

  /**
   * Consulta una historia clínica por su identificador.
   * @param id identificador de la historia.
   */
  consultar(id: number): Observable<HistoriaMedica> {
    return this.backend.get<HistoriaMedica>(environment.apiUrlAuth, this.endpoint, `${id}`);
  }

  /**
   * Lista las historias clínicas de una mascota (para asociar fórmulas médicas).
   * @param mascotaId identificador de la mascota.
   */
  listarPorMascota(mascotaId: number): Observable<HistoriaMedica[]> {
    return this.backend.get<HistoriaMedica[]>(environment.apiUrlAuth, this.endpoint, `mascota/${mascotaId}`);
  }

  /**
   * Registra una nueva historia clínica asociada a una cita atendida.
   * @param historia datos de la historia.
   */
  crear(historia: HistoriaMedicaRq): Observable<Respuesta> {
    return this.backend.post<Respuesta>(environment.apiUrlAuth, this.endpoint, 'crear', historia);
  }

  /**
   * Cierra una historia clínica (ya no admite nuevas anotaciones).
   * @param id identificador de la historia.
   */
  cerrar(id: number): Observable<Respuesta> {
    return this.backend.patch<Respuesta>(environment.apiUrlAuth, this.endpoint, `${id}/cerrar`);
  }

  /**
   * Consulta las anotaciones de una historia, de la más reciente a la más antigua.
   * @param historiaId identificador de la historia.
   */
  listarAnotaciones(historiaId: number): Observable<Anotacion[]> {
    return this.backend.get<Anotacion[]>(environment.apiUrlAuth, this.endpoint, `${historiaId}/anotaciones`);
  }

  /**
   * Consulta el detalle completo de una anotación.
   * @param anotacionId identificador de la anotación.
   */
  consultarAnotacion(anotacionId: number): Observable<Anotacion> {
    return this.backend.get<Anotacion>(environment.apiUrlAuth, this.endpoint, `anotaciones/${anotacionId}`);
  }

  /**
   * Agrega una anotación a una historia clínica existente.
   * @param historiaId identificador de la historia.
   * @param anotacion datos de la anotación.
   */
  crearAnotacion(historiaId: number, anotacion: AnotacionRq): Observable<Respuesta> {
    return this.backend.post<Respuesta>(environment.apiUrlAuth, this.endpoint, `${historiaId}/anotaciones`, anotacion);
  }
}
