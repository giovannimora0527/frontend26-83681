import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

export interface InventarioItem {
  medicamentoId: number;
  codigo: string;
  nombre: string;
  tipoProducto: string;
  presentacion: string;
  registroInvima: string | null;
  existenciaTotal: number;
  existenciaVencida: number;
  existenciaDispensable: number;
  stockMinimo: number;
  estadoStock: string;
  proximoAVencer: boolean;
  vencimientoMasCercano: string | null;
}

export interface LoteInventario {
  id: number;
  medicamentoId: number;
  codigoLote: string;
  fechaIngreso: string;
  fechaVencimiento: string;
  cantidadInicial: number;
  cantidadDisponible: number;
  costoUnitario: number;
  estado: string;
}

export interface MovimientoInventario {
  id: number;
  loteId: number;
  codigoLote: string;
  tipo: string;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  usuario: string;
  formulaId: number | null;
  referencia: string | null;
  detalle: string | null;
  fecha: string;
}

export interface ResultadoImportacion {
  importacionId?: number;
  totalFilas: number;
  filasValidas: number;
  filasImportadas: number;
  filasRechazadas: number;
  filas: Array<{ fila: number; codigoProducto: string; codigoLote: string; estado: string; mensaje: string }>;
}

export interface IngresoLote {
  medicamentoId: number;
  codigoLote: string;
  fechaVencimiento: string;
  cantidad: number;
  costoUnitario: number;
  detalle?: string;
}

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly api = environment.apiUrlAuth;

  constructor(private readonly backend: BackendService) {}

  resumen(estado?: string): Observable<InventarioItem[]> {
    const params = estado ? new HttpParams().set('estado', estado) : undefined;
    return this.backend.get(this.api, 'inventario', 'resumen', params);
  }

  lotes(medicamentoId: number): Observable<LoteInventario[]> {
    return this.backend.get(this.api, 'inventario/medicamentos', `${medicamentoId}/lotes`);
  }

  movimientos(medicamentoId: number): Observable<MovimientoInventario[]> {
    return this.backend.get(this.api, 'inventario/medicamentos', `${medicamentoId}/movimientos`);
  }

  registrarIngreso(request: IngresoLote): Observable<LoteInventario> {
    return this.backend.post(this.api, 'inventario', 'lotes', request);
  }

  previsualizar(archivo: File): Observable<ResultadoImportacion> {
    return this.enviarArchivo('previsualizar', archivo);
  }

  ejecutar(archivo: File): Observable<ResultadoImportacion> {
    return this.enviarArchivo('ejecutar', archivo);
  }

  private enviarArchivo(operacion: string, archivo: File): Observable<ResultadoImportacion> {
    const formData = new FormData();
    formData.append('archivo', archivo, archivo.name);
    return this.backend.postFile(this.api, 'inventario/importaciones', operacion, formData);
  }
}
