import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from 'src/app/models/usuario';
import { UsuarioRq, MiRespuestaRS } from 'src/app/models/requests';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private api = `usuario`;

  constructor(private backendService: BackendService) {}

  getUsuarios(): Observable<Usuario[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar-ordenado");
  }

  crearUsuario(rq: UsuarioRq): Observable<MiRespuestaRS> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", rq);
  }

  actualizarUsuario(rq: UsuarioRq): Observable<MiRespuestaRS> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "actualizar", rq);
  }

  eliminarUsuario(id: number): Observable<MiRespuestaRS> {
    return this.backendService.delete(environment.apiUrlAuth, this.api, `eliminar/${id}`);
  }
}
