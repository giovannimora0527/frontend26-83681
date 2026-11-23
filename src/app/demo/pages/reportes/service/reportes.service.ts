import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

export interface ReporteCitas {
  desde: string;
  hasta: string;
  total: number;
  citas: Array<{ id: number; fechaHora: string; cliente: string; mascota: string; medico: string; estado: string }>;
}

export interface ReporteFacturacion {
  desde: string;
  hasta: string;
  totalFacturas: number;
  subtotal: number;
  descuentos: number;
  impuestos: number;
  total: number;
  pagado: number;
  saldo: number;
  facturas: Array<{ id: number; citaId: number; fecha: string; estado: string; subtotal: number; descuento: number; impuesto: number; total: number; pagado: number; saldo: number }>;
}

export interface ReporteInventario {
  fechaCorte: string;
  productos: number;
  unidadesDisponibles: number;
  unidadesVencidas: number;
  productosBajoStock: number;
  productosProximosAVencer: number;
  valorInventario: number;
  productosDetalle: Array<{ medicamentoId: number; nombre: string; tipoProducto: string; existenciaTotal: number; existenciaDispensable: number; existenciaVencida: number; stockMinimo: number; estadoStock: string; vencimientoMasCercano: string | null; valorExistencia: number }>;
}

export interface ReporteMedicos {
  desde: string;
  hasta: string;
  totalCitas: number;
  totalAtendidas: number;
  totalCanceladas: number;
  medicos: Array<{ medicoId: number; medico: string; totalCitas: number; atendidas: number; canceladas: number; pendientes: number }>;
}

export type TipoReporte = 'citas' | 'facturacion' | 'inventario' | 'medicos';
export type FormatoReporte = 'pdf' | 'xlsx';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly api = environment.apiUrlAuth;

  constructor(private readonly backend: BackendService) {}

  citas(desde: string, hasta: string): Observable<ReporteCitas> {
    return this.backend.get(this.api, 'reportes', 'citas', this.fechas(desde, hasta));
  }

  facturacion(desde: string, hasta: string): Observable<ReporteFacturacion> {
    return this.backend.get(this.api, 'reportes', 'facturacion', this.fechas(desde, hasta));
  }

  inventario(): Observable<ReporteInventario> {
    return this.backend.get(this.api, 'reportes', 'inventario');
  }

  medicos(desde: string, hasta: string): Observable<ReporteMedicos> {
    return this.backend.get(this.api, 'reportes', 'medicos', this.fechas(desde, hasta));
  }

  /** medicoId es opcional: permite al backend limitar el reporte de citas al médico de la agenda. */
  descargar(tipo: TipoReporte, formato: FormatoReporte, desde: string, hasta: string, medicoId?: number): Observable<Blob> {
    let params = tipo === 'inventario' ? undefined : this.fechas(desde, hasta);
    if (medicoId && params) params = params.set('medicoId', medicoId);
    return this.backend.download(this.api, 'reportes', `${tipo}.${formato}`, params);
  }

  private fechas(desde: string, hasta: string): HttpParams {
    return new HttpParams().set('desde', desde).set('hasta', hasta);
  }
}
