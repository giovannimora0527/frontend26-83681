import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Mascota } from 'src/app/models/mascota';
import { Cliente } from 'src/app/models/cliente';
import { Raza } from 'src/app/models/raza';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

export interface MascotaRequest {
  mascotaId?: number;
  nombreMascota: string;
  edad: number;
  razaId: number;
  clienteId: number;
}

export interface MascotaResponse {
  status?: number;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MascotaServiceService {
  private readonly api = 'mascota';

  constructor(private readonly backendService: BackendService) {}

  getMascotas(): Observable<Mascota[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  getRazas(): Observable<Raza[]> {
    return this.backendService.get(environment.apiUrlAuth, 'raza', 'listar');
  }

  getClientes(): Observable<Cliente[]> {
    return this.backendService.get(environment.apiUrlAuth, 'cliente', 'all');
  }

  guardarMascota(mascota: MascotaRequest): Observable<MascotaResponse> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'guardar', mascota);
  }

  actualizarMascota(mascota: MascotaRequest): Observable<MascotaResponse> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'actualizar', mascota);
  }
}
