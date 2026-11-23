import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from 'src/app/models/usuario';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private api = `usuario`;

  constructor(private backendService: BackendService) { }

  // El backend expone GET /usuario/listar-ordenado (no existe /usuario/listar).
  getUsuarios(): Observable<Usuario[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'listar-ordenado');
  }

  getPerfiles(): Observable<PerfilUsuario[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'perfiles');
  }

  crearUsuario(request: UsuarioRequest): Observable<{ status: number; message: string }> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'guardar', request);
  }

  actualizarUsuario(request: UsuarioRequest): Observable<{ status: number; message: string }> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'actualizar', request);
  }
}

export interface PerfilUsuario {
  id: number;
  nombre: string;
}

export interface UsuarioRequest {
  id?: number;
  username: string;
  password: string | null;
  rol: string;
  email: string;
  perfilId: number;
  activo: boolean;
}
