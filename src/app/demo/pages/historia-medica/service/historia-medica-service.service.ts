import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoriaClinica } from 'src/app/models/historia-clinica';
import { HistoriaClinicaRq } from 'src/app/models/historia-clinica-rq';
import { RespuestaRs } from 'src/app/models/respuesta-rs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

// Servicio que consume los endpoints de /historia-clinica del backend
@Injectable({
  providedIn: 'root'
})
export class HistoriaMedicaServiceService {
  private api = `historia-clinica`;

  constructor(private backendService: BackendService) {

  }

  // GET: todas las historias (de la consulta mas reciente a la mas antigua)
  listarHistorias(): Observable<HistoriaClinica[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  // GET: detalle de una historia
  consultarHistoria(historiaId: number): Observable<HistoriaClinica> {
    const params = new HttpParams().set('historiaId', historiaId);
    return this.backendService.get(environment.apiUrlAuth, this.api, "consultar", params);
  }

  // POST: crear una historia clinica a partir de una cita atendida
  crearHistoria(historia: HistoriaClinicaRq): Observable<RespuestaRs> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "crear", historia);
  }

  // PATCH: cerrar la historia (ya no recibe anotaciones)
  cerrarHistoria(historiaId: number): Observable<RespuestaRs> {
    const params = new HttpParams().set('historiaId', historiaId);
    return this.backendService.patch(environment.apiUrlAuth, this.api, "cerrar", params);
  }

}
