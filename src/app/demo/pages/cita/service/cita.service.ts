import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cita } from 'src/app/models/cita';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/** Conecta la aplicación con las operaciones de citas del servidor. */
@Injectable({
  providedIn: 'root'
})
export class CitaService {

  private api = `cita`;
  
    /** Recibe los servicios y prepara el estado inicial del componente. */
    constructor(private backendService: BackendService) {
  
    }
  
    /** Consulta las citas. */
    listarCitas(): Observable<Cita[]> {
      return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
    }    

    /** Consulta el historial de citas de la mascota indicada. */
    listarCitasPorMascota(mascotaId: number): Observable<Cita[]> {
      const params = new HttpParams().set('mascotaId', mascotaId);
      return this.backendService.get(environment.apiUrlAuth, this.api, "listar-por-mascota", params);
    }

    /** Guarda la cita. */
    guardarCita(cita: Cita): Observable<Cita> {
      return this.backendService.post(environment.apiUrlAuth, this.api, "crear", cita);
    }

    /** Actualiza la cita. */
    actualizarCita(cita: Cita): Observable<Cita> {
      return this.backendService.post(environment.apiUrlAuth, this.api, "actualizar", cita);
    }

  
  }