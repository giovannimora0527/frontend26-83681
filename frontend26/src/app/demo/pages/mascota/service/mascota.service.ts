import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Mascota } from 'src/app/models/mascota';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MascotaService {
  private api = `mascota`;

  constructor(private backendService: BackendService) {
    
  }

  listarMascotas(): Observable<Mascota[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  listarMascotasPorCliente(clienteId: number): Observable<Mascota[]> {
    // El backend no expone "mascotas por cliente": se filtra el listado general por el cliente dueño.
    return this.listarMascotas().pipe(
      map((mascotas) => mascotas.filter((mascota) => mascota.cliente?.id === clienteId))
    );
  }

  crearMascota(mascota: Mascota): Observable<unknown> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", mascota);
  }

  actualizarMascota(mascota: Mascota): Observable<unknown> {
    console.log('Actualizando mascota:', mascota);
    return this.backendService.post(environment.apiUrlAuth, this.api, "actualizar", mascota);
  }

}
