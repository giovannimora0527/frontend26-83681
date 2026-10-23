import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { Mascota, MascotaRq } from 'src/app/models/mascota';
import { Respuesta } from 'src/app/models/respuesta';

/**
 * Servicio de acceso a los endpoints de mascotas del backend (/mascota).
 */
@Injectable({ providedIn: 'root' })
export class MascotaService {

  /** Nombre del recurso en la API. */
  private readonly endpoint = 'mascota';

  constructor(private backend: BackendService) { }

  /**
   * Lista todas las mascotas registradas.
   * @returns mascotas de la clínica.
   */
  listar(): Observable<Mascota[]> {
    return this.backend.get<Mascota[]>(environment.apiUrlAuth, this.endpoint, 'listar');
  }

  /**
   * Lista únicamente las mascotas que pertenecen a un cliente (para combos dependientes).
   * @param clienteId identificador del cliente.
   * @returns mascotas del cliente (404 si el cliente no existe).
   */
  listarPorCliente(clienteId: number): Observable<Mascota[]> {
    return this.backend.get<Mascota[]>(environment.apiUrlAuth, this.endpoint, `cliente/${clienteId}`);
  }

  /**
   * Consulta una mascota por su identificador.
   * @param mascotaId identificador de la mascota.
   * @returns la mascota encontrada (404 si no existe).
   */
  consultar(mascotaId: number): Observable<Mascota> {
    return this.backend.get<Mascota>(environment.apiUrlAuth, this.endpoint, `${mascotaId}`);
  }

  /**
   * Registra una nueva mascota.
   * @param mascota datos de la mascota.
   */
  guardar(mascota: MascotaRq): Observable<Respuesta> {
    return this.backend.post<Respuesta>(environment.apiUrlAuth, this.endpoint, 'guardar', mascota);
  }

  /**
   * Actualiza una mascota existente.
   * @param mascota datos de la mascota (con id).
   */
  actualizar(mascota: MascotaRq): Observable<Respuesta> {
    return this.backend.post<Respuesta>(environment.apiUrlAuth, this.endpoint, 'actualizar', mascota);
  }
}
