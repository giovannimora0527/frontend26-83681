import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { Cita } from 'src/app/models/cita';
import { Mascota } from 'src/app/models/mascota';
import { Cliente } from 'src/app/models/cliente';

export interface FormulaAtencionRq { medicamentoId: number; cantidad: number; dosis: string; frecuencia: string; duracion: string; viaAdministracion: string; indicaciones: string; }
export interface AtencionRq { citaId: number; medicoId: number; motivo: string; sintomas: string; diagnostico: string; observaciones: string; recomendaciones: string; formulas: FormulaAtencionRq[]; }
export interface ContextoAtencion { mascota: Mascota; propietario: Cliente; citas: Array<{ cita: Cita; historial: unknown[]; formulasPrevias: unknown[] }>; atenciones: unknown[]; }
@Injectable({ providedIn: 'root' })
export class AtencionService {
  constructor(private readonly backend: BackendService) {}
  contexto(mascotaId: number) { return this.backend.getPath<ContextoAtencion>(environment.apiUrlAuth, `atenciones/contexto/${mascotaId}`); }
  finalizar(request: AtencionRq) { return this.backend.postPath<{ id: number }>(environment.apiUrlAuth, 'atenciones/finalizar', request); }
  pdf(id: number) { return this.backend.getBlob(environment.apiUrlAuth, `atenciones/${id}/pdf`); }
  citas(fechaInicio: string, fechaFin: string) { const params = new HttpParams().set('fechaInicio', fechaInicio).set('fechaFin', fechaFin); return this.backend.getPath<Cita[]>(environment.apiUrlAuth, 'cita/mis-citas', params); }
}
