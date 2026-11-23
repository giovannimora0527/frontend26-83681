import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from 'src/app/models/usuario';
import { API_BASE } from 'src/app/services/api.util';

/** Datos que el backend espera para crear un usuario. */
export interface UsuarioRq {
  username: string;
  password: string;
  rol: string;
  email: string;
  activo: boolean;
}

/** Respuesta del backend al guardar un usuario. */
export interface RespuestaUsuario {
  status: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
<<<<<<< HEAD
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
=======
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE}/usuario`;

  /** @returns usuarios ordenados por username. */
  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.url}/listar`);
  }

  /** @param rq datos del usuario nuevo. */
  crear(rq: UsuarioRq): Observable<RespuestaUsuario> {
    return this.http.post<RespuestaUsuario>(`${this.url}/guardar`, rq);
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
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
