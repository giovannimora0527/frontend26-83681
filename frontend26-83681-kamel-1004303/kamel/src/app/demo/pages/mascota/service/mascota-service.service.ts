import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mascota } from 'src/app/models/mascota';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MascotaService {
  private api = 'mascota';

  constructor(private backendService: BackendService) {}

  getMascotas(): Observable<Mascota[]> {
    return this.backendService.get<Mascota[]>(
      environment.apiUrlAuth,
      this.api,
      'listar'
    );
  }

  getMascotasPorCliente(clienteId: number): Observable<Mascota[]> {
    const params = new HttpParams()
      .set('clienteId', clienteId);

    return this.backendService.get<Mascota[]>(
      environment.apiUrlAuth,
      this.api,
      'cliente',
      params
    );
  }

  getMascotaPorId(mascotaId: number): Observable<Mascota> {
    const params = new HttpParams()
      .set('mascotaId', mascotaId);

    return this.backendService.get<Mascota>(
      environment.apiUrlAuth,
      this.api,
      'id',
      params
    );
  }
}
