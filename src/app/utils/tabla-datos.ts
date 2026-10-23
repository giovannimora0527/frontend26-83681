/**
 * Clase reutilizable que le da a cualquier tabla (DataTable):
 *  - Filtro por texto (busca en las columnas que se indiquen).
 *  - Filtros adicionales (estado, rango de fechas, etc.).
 *  - Ordenamiento al hacer clic en el encabezado de una columna.
 *  - Paginacion.
 *
 * Se usa en citas, historias clinicas, anotaciones y formulas, asi no se
 * repite la misma logica en cada componente.
 */
export class TablaDatos<T> {

  /** Todos los registros recibidos del backend (sin filtrar). */
  private datos: T[] = [];

  /** Texto escrito por el usuario en el buscador. */
  filtroTexto = '';

  /** Columna por la que se ordena actualmente. */
  columnaOrden: string | null = null;

  /** Direccion del orden: ascendente o descendente. */
  direccionOrden: 'asc' | 'desc' = 'desc';

  /** Pagina que se esta mostrando. */
  paginaActual = 1;

  /** Cantidad de registros por pagina. */
  registrosPorPagina = 5;

  /** Opciones para el selector de registros por pagina. */
  opcionesRegistros = [5, 10, 20];

  /**
   * @param obtenerValor funcion que dice que valor tiene un registro en una columna (para ordenar).
   * @param textoBusqueda funcion que arma el texto en el que se busca con el filtro.
   * @param filtroExtra funcion opcional con filtros adicionales (estado, fechas...).
   */
  constructor(
    private obtenerValor: (item: T, columna: string) => unknown,
    private textoBusqueda: (item: T) => string,
    private filtroExtra: (item: T) => boolean = () => true
  ) {}

  /**
   * Carga los registros en la tabla y vuelve a la primera pagina.
   * @param datos lista recibida del backend.
   */
  setDatos(datos: T[]): void {
    this.datos = datos ?? [];
    this.paginaActual = 1;
  }

  /** Indica si la tabla no tiene ningun registro cargado. */
  get sinDatos(): boolean {
    return this.datos.length === 0;
  }

  /** Registros que cumplen los filtros, ya ordenados. */
  get filtrados(): T[] {
    const texto = TablaDatos.normalizar(this.filtroTexto);
    const resultado = this.datos.filter(item =>
      (texto === '' || TablaDatos.normalizar(this.textoBusqueda(item)).includes(texto))
      && this.filtroExtra(item));

    if (this.columnaOrden) {
      const columna = this.columnaOrden;
      const signo = this.direccionOrden === 'asc' ? 1 : -1;
      resultado.sort((a, b) => signo * TablaDatos.comparar(this.obtenerValor(a, columna), this.obtenerValor(b, columna)));
    }
    return resultado;
  }

  /** Registros de la pagina actual. */
  get pagina(): T[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.filtrados.slice(inicio, inicio + this.registrosPorPagina);
  }

  /** Total de registros que cumplen los filtros. */
  get total(): number {
    return this.filtrados.length;
  }

  /** Numero del primer registro mostrado (para "Mostrando X a Y de Z"). */
  get primerRegistro(): number {
    return this.total === 0 ? 0 : (this.paginaActual - 1) * this.registrosPorPagina + 1;
  }

  /** Numero del ultimo registro mostrado. */
  get ultimoRegistro(): number {
    return Math.min(this.paginaActual * this.registrosPorPagina, this.total);
  }

  /**
   * Ordena por una columna. Si ya estaba ordenada por esa columna, invierte la direccion.
   * @param columna nombre de la columna.
   */
  ordenarPor(columna: string): void {
    if (this.columnaOrden === columna) {
      this.direccionOrden = this.direccionOrden === 'asc' ? 'desc' : 'asc';
    } else {
      this.columnaOrden = columna;
      this.direccionOrden = 'asc';
    }
    this.paginaActual = 1;
  }

  /**
   * Icono que se muestra en el encabezado segun el orden actual.
   * @param columna nombre de la columna.
   */
  icono(columna: string): string {
    if (this.columnaOrden !== columna) {
      return 'feather icon-chevrons-down text-muted';
    }
    return this.direccionOrden === 'asc' ? 'feather icon-arrow-up' : 'feather icon-arrow-down';
  }

  /** Vuelve a la primera pagina (se llama cuando cambia un filtro). */
  reiniciarPagina(): void {
    this.paginaActual = 1;
  }

  /**
   * Pasa el texto a minusculas y le quita las tildes, para que buscar
   * "maria" encuentre "María".
   */
  private static normalizar(texto: string): string {
    return (texto ?? '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  }

  /**
   * Compara dos valores para ordenar. Los vacios van al final.
   * Las fechas en formato ISO (2026-10-22T10:00:00) se ordenan bien como texto.
   */
  private static comparar(a: unknown, b: unknown): number {
    if (a === null || a === undefined || a === '') return 1;
    if (b === null || b === undefined || b === '') return -1;
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return String(a).localeCompare(String(b), 'es', { numeric: true });
  }
}
