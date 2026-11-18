import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AsignacionLote, Despacho, FormulaPendiente } from 'src/app/models/inventario.model';

/** Servicio HTTP propio del módulo de dispensación y despacho. */
@Injectable({ providedIn: 'root' })
export class DespachoService {
  private readonly baseUrl = environment.apiUrlAuth;
  constructor(private readonly http: HttpClient) {}

  /** Consulta los despachos registrados para el historial del módulo. */
  listarDespachos(): Observable<Despacho[]> {
    return this.http.get<Despacho[]>(`${this.baseUrl}/inventario/dispensaciones/listar`, { headers: this.headers() });
  }

  /** Consulta fórmulas vigentes con cantidades pendientes por entregar. */
  listarPendientes(filtro = ''): Observable<FormulaPendiente[]> {
    const params = filtro ? new HttpParams().set('filtro', filtro) : undefined;
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
  confirmar(despachoId: number, detalles: AsignacionLote[]): Observable<Despacho> {
    const claveIdempotencia = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return this.http.post<Despacho>(`${this.baseUrl}/inventario/dispensaciones/${despachoId}/confirmar`, { claveIdempotencia, observacion: 'Entrega confirmada desde el módulo de despacho.', detalles }, { headers: this.headers() });
  }

  /** Consulta las líneas trazables de una entrega ya registrada. */
  detalle(despachoId: number): Observable<Record<string, unknown>[]> {
    return this.http.get<Record<string, unknown>[]>(`${this.baseUrl}/inventario/dispensaciones/${despachoId}/detalles`, { headers: this.headers() });
  }

  /** Añade el token de la sesión actual a las operaciones protegidas. */
  private headers(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json', Authorization: `Bearer ${sessionStorage.getItem('token') ?? ''}` });
  }
}
