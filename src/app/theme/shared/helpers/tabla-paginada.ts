/**
 * Busqueda y paginacion en memoria para las tablas del panel.
 * Uso: tabla = new TablaPaginada<Raza>((raza) => [raza.nombre, raza.especie]);
 */
export class TablaPaginada<T> {
  datos: T[] = [];
  terminoBusqueda = '';
  paginaActual = 1;

  constructor(
    private readonly camposBusqueda: (item: T) => unknown[],
    readonly registrosPorPagina = 10
  ) {}

  cargar(datos: T[]) {
    this.datos = datos;
    this.paginaActual = 1;
  }

  get filtrados(): T[] {
    const termino = normalizarTexto(this.terminoBusqueda.trim());
    if (!termino) {
      return this.datos;
    }
    return this.datos.filter((item) =>
      this.camposBusqueda(item).some((valor) => normalizarTexto(String(valor ?? '')).includes(termino))
    );
  }

  get paginados(): T[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.filtrados.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.filtrados.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, indice) => indice + 1);
  }

  buscar(event: Event) {
    this.terminoBusqueda = (event.target as HTMLInputElement).value;
    this.paginaActual = 1;
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }
}

// Elimina acentos y pasa a minusculas para comparar textos.
export function normalizarTexto(texto: string): string {
  return texto
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
