import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from 'src/app/models/usuario';
import { MiRespuestaRS, UsuarioRq } from 'src/app/models/requests';
import { BackendService } from 'src/app/services/backend.service';
import { MockDataService } from 'src/app/services/mock-data.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private api = `usuario`;

  constructor(private readonly backendService: BackendService,
    private readonly mock: MockDataService) {
  }

  getUsuarios(): Observable<Usuario[]> {
    if (environment.useMock) {
      return this.mock.listar<Usuario>('usuarios');
    }
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  /** @param password contraseña en texto plano; el backend se encarga de cifrarla. */
  guardarUsuario(usuario: Usuario, password: string): Observable<MiRespuestaRS> {
    if (environment.useMock) {
      // En modo de prueba nunca se guarda la contraseña.
      return this.mock.guardar('usuarios', usuario, 'id', 'fechaCreacion');
    }
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", this.toRq(usuario, password));
  }

  /** @param password solo se envia si se quiere cambiar. */
  actualizarUsuario(usuario: Usuario, password?: string): Observable<MiRespuestaRS> {
    if (environment.useMock) {
      return this.mock.actualizar('usuarios', usuario, 'id');
    }
    return this.backendService.post(environment.apiUrlAuth, this.api, "actualizar", this.toRq(usuario, password));
  }

  private toRq(usuario: Usuario, password?: string): UsuarioRq {
    return {
      id: usuario.id,
      username: usuario.username ?? '',
      ...(password ? { password } : {}),
      rol: usuario.rol ?? '',
      email: usuario.email ?? '',
      activo: !!usuario.activo
    };
  }
}
