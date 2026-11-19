import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { getJwtPayload } from 'src/app/utils/jwt.util';

/** Agrupa los valores enviados como filtros en una consulta. */
export type Filtros = Record<string, string | number>;
/** Describe un elemento que se puede elegir en un formulario. */
export interface Opcion { id: number; nombre: string; activo?: boolean }
/** Contiene los datos que se muestran para una cita en la agenda. */
export interface CitaAgenda {
  id: number; medicoId: number; mascotaId: number; mascota: string; propietario: string;
  inicio: string; fin: string; motivo: string; estado: string; propietarioId: number;
  edadMascota: number; razaMascota: string; especieMascota: string;
}

/** Agrupa los perfiles autorizados para las funciones de la clínica. */
export const perfilesClinica = {
  medicos: ['MEDICO', 'VETERINARIO'],
  admin: ['ADMIN', 'ADMINISTRADOR'],
  recepcion: ['RECEPCION', 'RECEPCIONISTA']
};

/** Obtiene el perfil de la sesión con el formato que usan los permisos de la clínica. */
export function perfilClinica(): string {
  try {
    return (getJwtPayload()?.rol ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .trim().toUpperCase().replace(/[\s-]+/g, '_');
  } catch {
    return '';
  }
}

/** Da formato a la fecha local para los campos y filtros de la aplicación. */
export function fechaLocal(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

/** Devuelve la fecha actual de Bogotá para usarla en formularios y filtros. */
export const hoyBogota = () => new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date());

/** Centraliza las consultas autenticadas y las descargas de los módulos clínicos. */
@Injectable({ providedIn: 'root' })
export class ClinicaApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrlAuth;

  /** Construye los encabezados de la petición con el token de la sesión. */
  private get headers() {
    return new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('token') ?? ''}`,
      'Content-Type': 'application/json'
    });
  }

  /** Realiza una consulta autenticada al servidor con los filtros recibidos. */
  leer<T>(ruta: string, params: Filtros = {}) {
    return this.http.get<T>(`${this.base}/${ruta}`, { headers: this.headers, params });
  }

  /** Envía datos al servidor mediante el método HTTP solicitado. */
  enviar<T>(metodo: 'POST' | 'PUT' | 'PATCH', ruta: string, body: unknown) {
    return this.http.request<T>(metodo, `${this.base}/${ruta}`, { headers: this.headers, body });
  }

  /** Solicita al servidor el archivo seleccionado y lo guarda desde el navegador. */
  descargar(ruta: string, archivo: string, error: (mensaje: string) => void, params: Filtros = {}) {
    this.http.get(`${this.base}/${ruta}`, { headers: this.headers, params, responseType: 'blob' }).subscribe({
      next: (contenido) => {
        const url = URL.createObjectURL(contenido);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = archivo;
        enlace.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      error: this.error(error)
    });
  }

  /** Abre un visor y carga el PDF obtenido mediante una petición autenticada. */
  abrirPdf(ruta: string, error: (mensaje: string) => void) {
    const visor = window.open('about:blank', '_blank');
    if (!visor) {
      error('El navegador bloqueó el visor. Puedes descargar el PDF e imprimirlo desde el archivo.');
      return;
    }
    visor.opener = null;
    visor.document.title = 'Cargando PDF…';
    this.http.get(`${this.base}/${ruta}`, { headers: this.headers, responseType: 'blob' }).subscribe({
      next: (contenido) => {
        if (visor.closed) return;
        const url = URL.createObjectURL(contenido);
        visor.location.replace(url);
        const seguimiento = window.setInterval(() => {
          if (!visor.closed) return;
          window.clearInterval(seguimiento);
          URL.revokeObjectURL(url);
        }, 1000);
      },
      error: (fallo: HttpErrorResponse) => {
        visor.close();
        void this.error(error)(fallo);
      }
    });
  }

  /** Devuelve un manejador que presenta el mensaje de error de la petición. */
  error(mostrar: (mensaje: string) => void) {
    return async (error: HttpErrorResponse) => {
      const fallback = error.status === 0 ? 'No se pudo conectar con la clínica.'
        : error.status === 403 ? 'Tu perfil no tiene acceso a esta operación.'
        : 'No se pudo completar la operación.';
      let detalle = error.error;
      if (detalle instanceof Blob) {
        try { detalle = JSON.parse(await detalle.text()); } catch { detalle = null; }
      }
      mostrar(detalle?.mensaje ?? detalle?.message ?? detalle?.detail ?? fallback);
    };
  }
}
