import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

export interface DespachoPendiente {
  formulaId: number;
  medicamentoId: number;
  medicamento: string;
  mascota: string;
  cantidad: number;
  fechaCreacion: string;
}

export interface DespachoResultado {
  despachoId: number;
  formulaId: number;
  cantidadSolicitada: number;
  cantidadDespachada: number;
  cantidadPendiente: number;
  estadoFormula: string;
  fecha: string;
  repetido: boolean;
}

export interface ComprobanteDespacho {
  formulaId: number;
  estado: string;
  medicamento: string;
  cantidadPrescrita: number;
  cantidadDespachada: number;
  fechaDespacho: string | null;
  lotes: Array<{ id: number; codigoLote: string; tipo: string; cantidad: number; usuario: string; fecha: string }>;
}

@Injectable({ providedIn: 'root' })
export class DespachoService {
  private readonly api = environment.apiUrlAuth;

  constructor(private readonly backend: BackendService) {}

  pendientes(): Observable<DespachoPendiente[]> {
    return this.backend.get(this.api, 'inventario/despachos', 'pendientes');
  }

  despachar(formulaId: number, cantidad: number, claveIdempotencia: string): Observable<DespachoResultado> {
    return this.backend.post(this.api, 'inventario/despachos', String(formulaId), { cantidad, claveIdempotencia });
  }

  comprobante(formulaId: number): Observable<ComprobanteDespacho> {
    return this.backend.get(this.api, 'inventario/despachos', String(formulaId));
  }

  descargarComprobante(formulaId: number): Observable<Blob> {
    return this.backend.download(this.api, 'inventario/despachos', `${formulaId}.pdf`);
  }
}
