import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from 'src/app/models/usuario';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/** Campos completos que valida el endpoint al cambiar el estado de una cuenta. */
export interface UsuarioActualizacion {
  id: number;
  username: string;
  email: string;
  perfilId: number;
  activo: boolean;
}

/** Conecta la aplicación con las operaciones de usuarios del servidor. */
@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private api = `usuario`;

  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor(private backendService: BackendService) { }

  /** Consulta la lista de usuarios. */
  getUsuarios(): Observable<Usuario[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  /** Actualiza un usuario mediante el endpoint protegido para administración. */
  actualizarUsuario(usuario: UsuarioActualizacion): Observable<unknown> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'actualizar', usuario);
  }
}
