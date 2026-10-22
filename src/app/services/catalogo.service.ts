import { map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ClienteResumen, MascotaCompleta, MascotaResumen, VeterinarioResumen } from 'src/app/models/catalogos';
import { API_BASE } from 'src/app/services/api.util';

/**
 * Consultas de catálogo para los combos dependientes: cliente → mascotas del cliente → citas.
 */
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE}/catalogo`;

  /** @returns todos los clientes. */
  clientes(): Observable<ClienteResumen[]> {
    return this.http.get<ClienteResumen[]>(`${this.url}/clientes`).pipe(
      // El backend envía la llave como clienteId; el combo usa id.
      map(lista => lista.map(c => ({ ...c, id: (c.clienteId ?? c.id) as number })))
    );
  }

  /**
   * @param clienteId cliente seleccionado.
   * @returns solo las mascotas de ese cliente.
   */
  mascotasDeCliente(clienteId: number): Observable<MascotaResumen[]> {
    return this.http.get<MascotaResumen[]>(`${this.url}/clientes/${clienteId}/mascotas`);
  }

  /**
   * @param id id de la mascota.
   * @returns la mascota con su cliente, para poblar los combos al editar.
   */
  mascota(id: number): Observable<MascotaCompleta> {
    return this.http.get<MascotaCompleta>(`${this.url}/mascotas/${id}`).pipe(
      map(m => ({
        ...m,
        cliente: m.cliente ? { ...m.cliente, id: (m.cliente.clienteId ?? m.cliente.id) as number } : null
      }))
    );
  }

  /** @returns todos los veterinarios. */
  veterinarios(): Observable<VeterinarioResumen[]> {
    return this.http.get<VeterinarioResumen[]>(`${this.url}/veterinarios`);
  }
}
