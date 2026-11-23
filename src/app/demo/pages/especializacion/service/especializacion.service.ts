import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Especializacion } from 'src/app/models/especializacion';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EspecializacionService {

<<<<<<< HEAD
  private api = `especializacion`;

  constructor(private backendService: BackendService) {

  }

  listar(): Observable<Especializacion[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  crearEspecializacion(especializacion: Especializacion): Observable<Especializacion> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "crear", especializacion);
  }

  actualizarEspecializacion(especializacion: Especializacion): Observable<Especializacion> {
    return this.backendService.put(environment.apiUrlAuth, this.api, "actualizar", especializacion);
  }
=======
  // Backend: GET {apiUrlAuth}/tablas/especializacion  ->  SELECT * FROM clinica.especializacion
  private api = `tablas`;
  private tabla = `especializacion`;

  constructor(private readonly backendService: BackendService) {
  }

  getEspecializaciones(): Observable<Especializacion[]> {
    return this.backendService.get<Especializacion[]>(environment.apiUrlAuth, this.api, this.tabla);
  }

>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
}
