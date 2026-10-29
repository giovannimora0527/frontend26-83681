import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from 'src/app/models/usuario';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Servicio que consume los endpoints REST del módulo de usuarios.
 */
@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly api = 'usuario';

  constructor(private readonly backendService: BackendService) {}

  /** Lista todos los usuarios registrados. */
  getUsuarios(): Observable<Usuario[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'listar');
  }

  /** Registra un nuevo usuario. */
  crearUsuario(usuario: Usuario): Observable<unknown> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'guardar', usuario);
  }

  /** Actualiza un usuario existente. */
  actualizarUsuario(usuario: Usuario): Observable<unknown> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'actualizar', usuario);
  }
}
