import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  InventarioLote,
  MedicamentoInventario,
  MovimientoInventario,
  RespuestaApi
} from 'src/app/models/inventario.model';

/** Acceso HTTP a los endpoints de catálogo, lotes, cargas masivas e inventario clínico. */
@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly baseUrl = environment.apiUrlAuth;

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

  /** Registra un lote y su movimiento de entrada asociado. */
  crearLote(datos: { medicamentoId: number; numeroLote: string; cantidad: number; precioCompraLote: number; fechaVencimiento: string }): Observable<RespuestaApi> {
    return this.http.post<RespuestaApi>(`${this.baseUrl}/inventario-lote/guardar`, datos, { headers: this.headers() });
  }

  /** Actualiza metadatos de lote sin modificar directamente su saldo. */
  actualizarLote(id: number, datos: { medicamentoId: number; numeroLote: string; precioCompraLote: number; fechaVencimiento: string; activo: boolean }): Observable<RespuestaApi> {
    return this.http.post<RespuestaApi>(`${this.baseUrl}/inventario-lote/actualizar/${id}`, datos, { headers: this.headers() });
  }

  /** Lee el historial de movimientos para la tabla de trazabilidad. */
  listarMovimientos(): Observable<MovimientoInventario[]> {
    return this.get('/movimiento-inventario/listar');
  }

  /** Envía un archivo CSV/XLSX para validar su estructura y sus filas. */
  previsualizarCarga(archivo: File): Observable<Record<string, unknown>> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<Record<string, unknown>>(`${this.baseUrl}/inventario/carga-masiva/previsualizar`, formData, {
      headers: new HttpHeaders({ Authorization: `Bearer ${sessionStorage.getItem('token') ?? ''}` })
    });
  }

  /** Confirma la importación de los registros válidos de una previsualización. */
  confirmarCarga(cargaId: number): Observable<RespuestaApi> {
    return this.http.post<RespuestaApi>(`${this.baseUrl}/inventario/carga-masiva/${cargaId}/confirmar`, {}, { headers: this.headers() });
  }

  /** Descarga el Excel de inventario con tipo y rango de fechas opcionales. */
  exportarInforme(tipo: string, desde?: string, hasta?: string): Observable<Blob> {
    let params = new HttpParams().set('tipo', tipo);
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get(`${this.baseUrl}/medicamento/informes/exportar-excel`, {
      headers: this.headers(), params, responseType: 'blob'
    });
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
