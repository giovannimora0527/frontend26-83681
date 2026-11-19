import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AsignacionLote, Despacho, FormulaPendiente } from 'src/app/models/inventario.model';

/** Servicio HTTP propio del módulo de dispensación y despacho. */
@Injectable({ providedIn: 'root' })
export class DespachoService {
  private readonly baseUrl = environment.apiUrlAuth;
  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor(private readonly http: HttpClient) {}

  /** Consulta los despachos registrados para el historial del módulo. */
  listarDespachos(): Observable<Despacho[]> {
    return this.http.get<Despacho[]>(`${this.baseUrl}/inventario/dispensaciones/historial`, { headers: this.headers() });
  }

  /** Consulta fórmulas vigentes con cantidades pendientes por entregar. */
  listarPendientes(filtro = '', fecha = ''): Observable<FormulaPendiente[]> {
    let params = new HttpParams();
    if (filtro) params = params.set('filtro', filtro);
    if (fecha) params = params.set('fechaGeneracion', fecha);
    return this.http.get<FormulaPendiente[]>(`${this.baseUrl}/inventario/dispensaciones/formulas-pendientes`, { params, headers: this.headers() });
  }

  /** Obtiene los saldos actuales y lotes seleccionables de una fórmula. */
  consultarPreparacion(formulaId: number): Observable<FormulaPendiente> {
    return this.http.get<FormulaPendiente>(`${this.baseUrl}/inventario/dispensaciones/formula/${formulaId}/preparacion`, { headers: this.headers() });
  }

  /** Crea el despacho en preparación sin descontar todavía existencias. */
  preparar(formulaId: number): Observable<Despacho> {
    return this.http.post<Despacho>(`${this.baseUrl}/inventario/dispensaciones/preparar`, { formulaId, observacion: 'Preparación iniciada desde el módulo de despacho.' }, { headers: this.headers() });
  }

  /** Confirma cantidades por lote usando una clave idempotente para la operación. */
  confirmar(despachoId: number, detalles: AsignacionLote[], claveIdempotencia: string): Observable<Despacho> {
    return this.http.post<Despacho>(`${this.baseUrl}/inventario/dispensaciones/${despachoId}/confirmar`, { claveIdempotencia, observacion: 'Entrega confirmada desde el módulo de despacho.', detalles }, { headers: this.headers() });
  }

  /** Consulta las líneas trazables de una entrega ya registrada. */
  detalle(despachoId: number): Observable<Record<string, unknown>[]> {
    return this.http.get<Record<string, unknown>[]>(`${this.baseUrl}/inventario/dispensaciones/${despachoId}/detalles`, { headers: this.headers() });
  }

  /** Consulta los cambios de estado que se guardaron para el despacho. */
  historialEstados(id: number): Observable<Record<string, unknown>[]> {
    return this.http.get<Record<string, unknown>[]>(`${this.baseUrl}/inventario/dispensaciones/${id}/historial-estados`, { headers: this.headers() });
  }

  /** Consulta las entregas registradas para un medicamento. */
  historialMedicamento(id: number): Observable<Record<string, unknown>[]> {
    return this.http.get<Record<string, unknown>[]>(`${this.baseUrl}/inventario/dispensaciones/medicamento/${id}/historial`, { headers: this.headers() });
  }

  /** Solicita al servidor el PDF del comprobante de despacho. */
  comprobante(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/inventario/dispensaciones/${id}/comprobante`, { headers: this.headers(), responseType: 'blob' });
  }

  /** Solicita cancelar el registro indicado. */
  cancelar(id: number, observacion: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/inventario/dispensaciones/${id}/cancelar`, { observacion }, { headers: this.headers() });
  }

  /** Añade el token de la sesión actual a las operaciones protegidas. */
  private headers(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json', Authorization: `Bearer ${sessionStorage.getItem('token') ?? ''}` });
  }
}
