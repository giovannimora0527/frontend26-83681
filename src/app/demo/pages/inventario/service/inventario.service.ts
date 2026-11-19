import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  FiltrosInformeInventario,
  InformeInventario,
  InventarioLote,
  MedicamentoInventario,
  MovimientoInventario,
  RespuestaApi
} from 'src/app/models/inventario.model';

/** Contiene los datos enviados al registrar un lote. */
export interface RegistroLote {
  medicamentoId: number;
  numeroLote: string;
  cantidad: number;
  precioCompraLote: number;
  fechaVencimiento: string | null;
}

/** Contiene las filas válidas y los errores que devuelve la carga masiva. */
export interface ResultadoCarga {
  cargaId: number;
  registrosValidos?: number;
  registrosImportados?: number;
  errores: { fila: number; motivo: string }[];
  registros?: Record<string, string>[];
}

/** Acceso HTTP a los endpoints de catálogo, lotes, cargas masivas e inventario clínico. */
@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly baseUrl = environment.apiUrlAuth;

  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor(private readonly http: HttpClient) {}

  /** Consulta el catálogo de productos; la vista limita las filas visibles con paginación. */
  listarMedicamentos(): Observable<MedicamentoInventario[]> {
    return this.get('/medicamento/listar');
  }

  /** Consulta la proyección reducida de productos para perfiles de lectura y despacho. */
  listarInventarioParaConsulta(): Observable<MedicamentoInventario[]> {
    return this.get('/medicamento/disponibilidad');
  }

  /** Registra los datos del producto y, si hay saldo inicial, su lote trazable. */
  crearMedicamento(datos: Partial<MedicamentoInventario> & Record<string, unknown>): Observable<RespuestaApi> {
    return this.http.post<RespuestaApi>(`${this.baseUrl}/medicamento/crear`, datos, { headers: this.headers() });
  }

  /** Actualiza datos descriptivos sin cambiar el saldo que controla el backend. */
  actualizarMedicamento(datos: Partial<MedicamentoInventario> & Record<string, unknown>): Observable<RespuestaApi> {
    return this.http.put<RespuestaApi>(`${this.baseUrl}/medicamento/actualizar`, datos, { headers: this.headers() });
  }

  /** Consulta los lotes ordenados por vencimiento para seguimiento y preparación. */
  listarLotes(): Observable<InventarioLote[]> {
    return this.get('/inventario-lote/listar');
  }

  /** Guarda el lote. */
  guardarLote(lote: RegistroLote): Observable<RespuestaApi> {
    return this.http.post<RespuestaApi>(this.baseUrl + '/inventario-lote/guardar', lote, { headers: this.headers() });
  }

  /** Lee el historial de movimientos para la tabla de trazabilidad. */
  listarMovimientos(medicamentoId: number | null = null): Observable<MovimientoInventario[]> {
    if (medicamentoId !== null) return this.get(`/medicamento/${medicamentoId}/movimientos`);

    return this.get<Array<MovimientoInventario & {
      medicamento?: { id: number };
      lote?: { id: number };
      formula?: { id: number };
      despacho?: { id: number };
      usuario?: { id: number; username?: string };
    }>>('/movimiento-inventario/listar').pipe(map((movimientos) => (movimientos ?? []).map((movimiento) => ({
      ...movimiento,
      medicamentoId: movimiento.medicamentoId ?? movimiento.medicamento?.id,
      loteId: movimiento.loteId ?? movimiento.lote?.id,
      formulaId: movimiento.formulaId ?? movimiento.formula?.id,
      despachoId: movimiento.despachoId ?? movimiento.despacho?.id,
      usuarioId: movimiento.usuarioId ?? movimiento.usuario?.id,
      usuarioNombre: movimiento.usuarioNombre ?? movimiento.usuario?.username
    }))));
  }

  /** Envía un archivo CSV/XLSX para validar su estructura y sus filas. */
  previsualizarCarga(archivo: File): Observable<ResultadoCarga> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<ResultadoCarga>(`${this.baseUrl}/inventario/carga-masiva/previsualizar`, formData, {
      headers: new HttpHeaders({ Authorization: `Bearer ${sessionStorage.getItem('token') ?? ''}` })
    });
  }

  /** Confirma la importación de los registros válidos de una previsualización. */
  confirmarCarga(cargaId: number): Observable<ResultadoCarga> {
    return this.http.post<ResultadoCarga>(`${this.baseUrl}/inventario/carga-masiva/${cargaId}/confirmar`, {}, { headers: this.headers() });
  }

  /** Genera la vista previa del informe de inventario con el tipo y las fechas indicados. */
  consultarInforme(filtros: FiltrosInformeInventario): Observable<InformeInventario> {
    return this.http.get<InformeInventario>(`${this.baseUrl}/medicamento/informes`, {
      headers: this.headers(), params: this.parametrosInforme(filtros)
    });
  }

  /** Descarga el informe de inventario en el formato y con los filtros solicitados. */
  exportarInforme(formato: 'pdf' | 'excel', filtros: FiltrosInformeInventario): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/medicamento/informes/exportar-${formato}`, {
      headers: this.headers(), params: this.parametrosInforme(filtros), responseType: 'blob'
    });
  }

  /** Convierte el tipo y las fechas del informe en parámetros de la ruta. */
  private parametrosInforme({ tipo, desde, hasta }: FiltrosInformeInventario): HttpParams {
    let params = new HttpParams().set('tipo', tipo);
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return params;
  }

  /** Ejecuta una lectura autenticada contra una ruta del backend. */
  private get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, { headers: this.headers() });
  }

  /** Adjunta el token de sesión y el tipo de contenido esperado por la API. */
  private headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem('token') ?? ''}`
    });
  }

}
