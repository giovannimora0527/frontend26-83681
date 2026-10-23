import { HttpParams } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { Orden, PaginaRs } from 'src/app/models/pagina';
import { construirParams } from 'src/app/utils/params.util';
import { notificarError } from 'src/app/utils/notificacion.util';

/**
 * Lógica común de los DataTables con paginación, filtros y ordenamiento del
 * lado del servidor. Cada pantalla extiende esta clase e indica cómo consultar
 * al backend y cuáles son sus filtros; así no se repite el manejo de páginas,
 * orden, estado de carga y errores en cada componente.
 * @template T Tipo de los registros de la tabla.
 */
export abstract class TablaPaginada<T> {
  /** Registros de la página actual. */
  registros: T[] = [];
  /** Página actual (empieza en 0, igual que el backend). */
  pagina = 0;
  /** Registros por página. */
  tamanio = 10;
  /** Total de registros que cumplen los filtros. */
  totalRegistros = 0;
  /** Total de páginas. */
  totalPaginas = 0;
  /** Indica si hay una consulta en curso (para mostrar el indicador de carga). */
  cargando = false;
  /** Ordenamiento actual. */
  orden: Orden;

  /** Temporizador usado para no consultar en cada tecla del buscador. */
  private temporizadorBusqueda?: ReturnType<typeof setTimeout>;
  /** Consulta en curso; se cancela si llega una nueva antes de terminar. */
  private consultaActual?: Subscription;

  /**
   * @param ordenInicial Orden con el que se muestra la tabla al abrirla.
   */
  protected constructor(private readonly ordenInicial: Orden) {
    this.orden = { ...ordenInicial };
  }

  /**
   * Consulta una página al backend.
   * @param params Parámetros de paginación, orden y filtros.
   * @returns Observable con la página consultada.
   */
  protected abstract consultar(params: HttpParams): Observable<PaginaRs<T>>;

  /**
   * Filtros propios de la pantalla (texto, estado, fechas...).
   * @returns Objeto con los filtros actuales.
   */
  protected abstract filtros(): Record<string, unknown>;

  /** Mensaje que se muestra si la consulta falla. */
  protected abstract readonly mensajeErrorConsulta: string;

  /**
   * Consulta la página actual con los filtros y el orden vigentes.
   */
  cargar(): void {
    this.consultaActual?.unsubscribe();
    this.cargando = true;
    const params = construirParams({
      ...this.filtros(),
      pagina: this.pagina,
      tamanio: this.tamanio,
      ordenarPor: this.orden.columna,
      direccion: this.orden.direccion
    });
    this.consultaActual = this.consultar(params).subscribe({
      next: (respuesta) => {
        this.registros = respuesta.contenido;
        this.totalRegistros = respuesta.totalRegistros;
        this.totalPaginas = respuesta.totalPaginas;
        this.cargando = false;
      },
      error: (error) => {
        this.registros = [];
        this.totalRegistros = 0;
        this.totalPaginas = 0;
        this.cargando = false;
        notificarError(error, this.mensajeErrorConsulta);
      }
    });
  }

  /**
   * Aplica los filtros desde la primera página.
   */
  buscar(): void {
    this.pagina = 0;
    this.cargar();
  }

  /**
   * Aplica el filtro de texto con un pequeño retraso, para no consultar al
   * backend en cada tecla que se presiona.
   */
  buscarConRetraso(): void {
    clearTimeout(this.temporizadorBusqueda);
    this.temporizadorBusqueda = setTimeout(() => this.buscar(), 400);
  }

  /**
   * Ordena por una columna. Si ya estaba ordenada por esa columna se invierte la dirección.
   * @param columna Columna seleccionada.
   */
  ordenarPor(columna: string): void {
    const mismaColumna = this.orden.columna === columna;
    this.orden = {
      columna,
      direccion: mismaColumna && this.orden.direccion === 'asc' ? 'desc' : 'asc'
    };
    this.buscar();
  }

  /**
   * Cambia de página.
   * @param pagina Página solicitada (empieza en 0).
   */
  irAPagina(pagina: number): void {
    this.pagina = pagina;
    this.cargar();
  }

  /**
   * Cambia la cantidad de registros por página.
   * @param tamanio Nueva cantidad de registros por página.
   */
  cambiarTamanio(tamanio: number): void {
    this.tamanio = tamanio;
    this.buscar();
  }

  /**
   * Restablece el orden inicial de la tabla (lo usan los botones "Limpiar").
   */
  protected restablecerOrden(): void {
    this.orden = { ...this.ordenInicial };
  }
}
