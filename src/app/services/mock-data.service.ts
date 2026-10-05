import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { MiRespuestaRS } from 'src/app/models/requests';
import { DATOS_EJEMPLO, TablaEjemplo } from './mock/datos-ejemplo';

type Registro = Record<string, unknown>;

/**
 * Simula el backend mientras environment.useMock = true.
 * Los cambios se guardan en el localStorage del navegador para que no se pierdan al recargar.
 */
@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private readonly claveStorage = 'veterinaria-datos-ejemplo';
  private readonly demora = 250; // ms, para que se note el "cargando" como con un backend real.
  private tablas: Record<TablaEjemplo, Registro[]>;

  constructor() {
    this.tablas = this.cargar();
  }

  listar<T>(tabla: TablaEjemplo): Observable<T[]> {
    return of(structuredClone(this.tablas[tabla]) as T[]).pipe(delay(this.demora));
  }

  /**
   * Agrega un registro asignandole el siguiente id.
   * @param campoFecha campo donde se guarda la fecha de creacion, si el modelo lo tiene.
   */
  guardar<T extends object>(tabla: TablaEjemplo, item: T, campoId: string, campoFecha?: string): Observable<MiRespuestaRS> {
    this.insertar(tabla, item, campoId, campoFecha);
    return this.responder('Registro creado correctamente');
  }

  /**
   * Reemplaza el registro con el mismo id.
   * @param campoFecha campo donde se guarda la fecha de modificacion, si el modelo lo tiene.
   */
  actualizar<T extends object>(tabla: TablaEjemplo, item: T, campoId: string, campoFecha?: string): Observable<MiRespuestaRS> {
    const registro = { ...item } as Registro;
    if (campoFecha) {
      registro[campoFecha] = this.ahora();
    }
    const filas = this.tablas[tabla];
    const indice = filas.findIndex((fila) => fila[campoId] === registro[campoId]);
    if (indice === -1) {
      return this.responder('Registro no encontrado', 404);
    }
    filas[indice] = { ...filas[indice], ...structuredClone(registro) };
    this.persistir();
    return this.responder('Registro actualizado correctamente');
  }

  /** Acceso directo para operaciones que tocan varias tablas (ej. anotaciones de historia). */
  insertar<T extends object>(tabla: TablaEjemplo, item: T, campoId: string, campoFecha?: string): T {
    const filas = this.tablas[tabla];
    const registro = structuredClone({ ...item }) as Registro;
    registro[campoId] = filas.reduce((max, fila) => Math.max(max, Number(fila[campoId]) || 0), 0) + 1;
    if (campoFecha) {
      registro[campoFecha] = this.ahora();
    }
    filas.push(registro);
    this.persistir();
    return structuredClone(registro) as T;
  }

  buscar<T>(tabla: TablaEjemplo, condicion: (fila: T) => boolean): T | undefined {
    const encontrado = (this.tablas[tabla] as T[]).find(condicion);
    return encontrado ? structuredClone(encontrado) : undefined;
  }

  responder(message: string, status = 200): Observable<MiRespuestaRS> {
    return of({ status, message }).pipe(delay(this.demora));
  }

  /** Vuelve a los datos de ejemplo originales. */
  reiniciar() {
    this.tablas = structuredClone(DATOS_EJEMPLO) as unknown as Record<TablaEjemplo, Registro[]>;
    this.persistir();
  }

  // Fecha local en formato yyyy-MM-ddTHH:mm:ss (el que usa LocalDateTime en el backend).
  private ahora(): string {
    const fecha = new Date();
    fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());
    return fecha.toISOString().substring(0, 19);
  }

  private cargar(): Record<TablaEjemplo, Registro[]> {
    const base = structuredClone(DATOS_EJEMPLO) as unknown as Record<TablaEjemplo, Registro[]>;
    try {
      const guardado = localStorage.getItem(this.claveStorage);
      if (guardado) {
        return { ...base, ...JSON.parse(guardado) };
      }
    } catch {
      // Si el navegador bloquea el storage se trabaja solo en memoria.
    }
    return base;
  }

  private persistir() {
    try {
      localStorage.setItem(this.claveStorage, JSON.stringify(this.tablas));
    } catch {
      // Sin storage disponible los cambios duran hasta recargar la pagina.
    }
  }
}
