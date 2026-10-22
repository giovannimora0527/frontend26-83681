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
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE}/usuario`;

  /** @returns usuarios ordenados por username. */
  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.url}/listar`);
  }

  /** @param rq datos del usuario nuevo. */
  crear(rq: UsuarioRq): Observable<RespuestaUsuario> {
    return this.http.post<RespuestaUsuario>(`${this.url}/guardar`, rq);
  }
}
