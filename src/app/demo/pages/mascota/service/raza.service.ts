import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Raza } from 'src/app/models/raza';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/** Conecta la aplicación con las operaciones de mascotas del servidor. */
@Injectable({
  providedIn: 'root'
})
export class RazaService {

  private api = `raza`;

  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor(private backendService: BackendService) {

  }

  /** Consulta las razas. */
  listarRazas(): Observable<Raza[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

}
