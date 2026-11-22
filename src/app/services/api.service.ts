import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

/** Cliente HTTP genérico para los módulos del proyecto integrador (JWT en el encabezado Authorization). */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.apiUrlAuth;

  constructor(private readonly http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = sessionStorage.getItem('token') || '';
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private params(p?: Record<string, unknown>): HttpParams {
    let hp = new HttpParams();
    Object.entries(p ?? {}).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') {
        hp = hp.set(k, String(v));
      }
    });
    return hp;
  }

  get<T>(path: string, p?: Record<string, unknown>): Observable<T> {
    return this.http.get<T>(`${this.base}${path}`, { headers: this.headers(), params: this.params(p) });
  }

  post<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.post<T>(`${this.base}${path}`, body, { headers: this.headers() });
  }

  put<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.put<T>(`${this.base}${path}`, body, { headers: this.headers() });
  }

  patch<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.patch<T>(`${this.base}${path}`, body, { headers: this.headers() });
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.base}${path}`, { headers: this.headers() });
  }

  upload<T>(path: string, form: FormData): Observable<T> {
    return this.http.post<T>(`${this.base}${path}`, form, { headers: this.headers() });
  }

  blob(path: string, p?: Record<string, unknown>): Observable<Blob> {
    return this.http.get(`${this.base}${path}`, { headers: this.headers(), params: this.params(p), responseType: 'blob' });
  }

  /** Descarga un archivo (PDF, Excel) generado por el backend. */
  descargar(path: string, nombre: string, p?: Record<string, unknown>, abrir = false): void {
    this.blob(path, p).subscribe({
      next: (b) => {
        const url = URL.createObjectURL(b);
        if (abrir) {
          window.open(url, '_blank');
        } else {
          const a = document.createElement('a');
          a.href = url;
          a.download = nombre;
          a.click();
        }
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      },
      error: (err) => this.error(err),
    });
  }

  /** Extrae el mensaje de error del backend (también cuando la respuesta era un blob). */
  async mensaje(err: any): Promise<string> {
    let e = err?.error;
    if (e instanceof Blob) {
      try {
        e = JSON.parse(await e.text());
      } catch {
        e = null;
      }
    }
    return e?.message || err?.message || 'No fue posible completar la operación.';
  }

  error(err: any): void {
    this.mensaje(err).then((m) => Swal.fire({ icon: 'error', title: 'Atención', text: m }));
  }

  ok(texto: string): void {
    Swal.fire({ icon: 'success', title: texto, timer: 1600, showConfirmButton: false });
  }

  async confirmar(titulo: string, texto = '', boton = 'Confirmar'): Promise<boolean> {
    const r = await Swal.fire({ icon: 'question', title: titulo, text: texto, showCancelButton: true, confirmButtonText: boton, cancelButtonText: 'Cancelar' });
    return r.isConfirmed;
  }

  /** Pide un texto (p. ej. el motivo de una cancelación). Devuelve null si se cancela. */
  async pedirTexto(titulo: string, etiqueta = 'Motivo'): Promise<string | null> {
    const r = await Swal.fire({ title: titulo, input: 'textarea', inputLabel: etiqueta, showCancelButton: true, confirmButtonText: 'Aceptar', cancelButtonText: 'Cancelar', inputValidator: (v) => (!v || !v.trim() ? 'Este campo es obligatorio' : null) });
    return r.isConfirmed ? String(r.value).trim() : null;
  }
}
