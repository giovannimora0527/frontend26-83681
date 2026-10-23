import { Component, Input, OnChanges, SimpleChanges, TemplateRef } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { CLASES_ESTADO } from 'src/app/models/estados';

/** Tipos de dato que sabe pintar la tabla. */
export type TipoColumna = 'texto' | 'numero' | 'fecha' | 'hora' | 'fechaHora' | 'insignia';

/** Descripción de una columna de la tabla. */
export interface ColumnaTabla {
  /** Identificador único de la columna (se usa en los filtros). */
  id: string;
  /** Texto del encabezado. */
  etiqueta: string;
  /** Ruta de la propiedad dentro de la fila (admite anidación: 'raza.nombre'). */
  ruta: string;
  /** Tipo de dato; por defecto 'texto'. */
  tipo?: TipoColumna;
  /** Si es false la columna no se puede ordenar; por defecto es ordenable. */
  ordenable?: boolean;
  /** Habilita un filtro propio para la columna: caja de texto o lista desplegable. */
  filtro?: 'texto' | 'lista';
  /** Función opcional para construir el texto mostrado a partir de la fila completa. */
  formateador?: (fila: any) => string;
}

/** Orden aplicado a la tabla. */
export interface OrdenTabla {
  /** Ruta de la propiedad por la que se ordena (puede no ser una columna visible). */
  ruta: string;
  direccion: 'asc' | 'desc';
}

/**
 * Tabla de datos reutilizable (DataTable) con búsqueda general, filtros por columna,
 * filtro por rango de fechas, ordenamiento por columnas y paginación.
 * Todo el procesamiento es del lado del cliente sobre las filas recibidas.
 */
@Component({
  selector: 'app-tabla-datos',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPagination],
  templateUrl: './tabla-datos.component.html',
  styleUrl: './tabla-datos.component.scss'
})
export class TablaDatosComponent implements OnChanges {

  /** Columnas a mostrar. */
  @Input() columnas: ColumnaTabla[] = [];
  /** Filas (datos) a mostrar. */
  @Input() filas: any[] = [];
  /** Muestra un indicador de carga mientras se consulta el backend. */
  @Input() cargando = false;
  /** Orden inicial de la tabla. */
  @Input() ordenInicial: OrdenTabla = { ruta: '', direccion: 'asc' };
  /** Ruta de la fecha sobre la que se aplica el filtro "desde / hasta" (opcional). */
  @Input() rutaFiltroFechas?: string;
  /** Opciones del selector de tamaño de página. */
  @Input() tamanosPagina: number[] = [5, 10, 25, 50];
  /** Tamaño de página inicial. */
  @Input() tamanoPagina = 10;
  /** Plantilla con los botones de acción de cada fila (recibe la fila como contexto implícito). */
  @Input() plantillaAcciones?: TemplateRef<any>;
  /** Mensaje cuando no hay filas para mostrar. */
  @Input() mensajeVacio = 'No hay registros para mostrar.';
  /** Texto de ayuda de la búsqueda general. */
  @Input() textoBusqueda = 'Buscar en todas las columnas...';

  /** Texto de la búsqueda general. */
  busqueda = '';
  /** Valor del filtro de cada columna, indexado por id de columna. */
  filtrosColumna: Record<string, string> = {};
  /** Fecha inicial del filtro por rango (yyyy-MM-dd). */
  fechaDesde = '';
  /** Fecha final del filtro por rango (yyyy-MM-dd). */
  fechaHasta = '';
  /** Orden vigente. */
  orden: OrdenTabla = { ruta: '', direccion: 'asc' };
  /** Página actual (base 1). */
  pagina = 1;
  /** Filas que cumplen los filtros, ya ordenadas. */
  filasFiltradas: any[] = [];
  /** Filas de la página actual. */
  filasPagina: any[] = [];

  /** Indica si el orden ya fue inicializado con el orden inicial. */
  private ordenInicializado = false;

  /** Reacciona a cambios de filas, columnas u orden inicial. */
  ngOnChanges(cambios: SimpleChanges): void {
    if ((cambios['ordenInicial'] || !this.ordenInicializado) && this.ordenInicial?.ruta !== undefined) {
      this.orden = { ...this.ordenInicial };
      this.ordenInicializado = true;
    }
    this.recalcular();
  }

  /** Columnas que tienen filtro propio. */
  get columnasFiltrables(): ColumnaTabla[] {
    return this.columnas.filter((c) => !!c.filtro);
  }

  /** Cantidad total de columnas visibles (incluye acciones). */
  get totalColumnas(): number {
    return this.columnas.length + (this.plantillaAcciones ? 1 : 0);
  }

  /** Primer registro mostrado (para el texto "Mostrando x a y de z"). */
  get primerRegistro(): number {
    return this.filasFiltradas.length === 0 ? 0 : (this.pagina - 1) * this.tamanoPagina + 1;
  }

  /** Último registro mostrado. */
  get ultimoRegistro(): number {
    return Math.min(this.pagina * this.tamanoPagina, this.filasFiltradas.length);
  }

  /**
   * Obtiene el valor de una propiedad anidada de una fila.
   * @param fila objeto de la fila.
   * @param ruta ruta de la propiedad, ej. 'raza.nombre'.
   */
  valor(fila: any, ruta: string): any {
    return ruta.split('.').reduce((acc, parte) => (acc === null || acc === undefined ? undefined : acc[parte]), fila);
  }

  /**
   * Construye el texto que se muestra (y por el que se filtra) en una celda.
   * @param fila fila actual.
   * @param columna columna actual.
   */
  texto(fila: any, columna: ColumnaTabla): string {
    if (columna.formateador) {
      return columna.formateador(fila) ?? '';
    }
    const v = this.valor(fila, columna.ruta);
    if (v === null || v === undefined || v === '') {
      return '';
    }
    switch (columna.tipo) {
      case 'fecha': return formatDate(v, 'dd/MM/yyyy', 'en-US');
      case 'hora': return formatDate(v, 'HH:mm', 'en-US');
      case 'fechaHora': return formatDate(v, 'dd/MM/yyyy HH:mm', 'en-US');
      case 'insignia': return this.capitalizar(String(v));
      default: return String(v);
    }
  }

  /** Clase CSS de la insignia según el valor (estado) de la celda. */
  claseInsignia(fila: any, columna: ColumnaTabla): string {
    const v = String(this.valor(fila, columna.ruta) ?? '');
    return CLASES_ESTADO[v] ?? 'bg-secondary';
  }

  /** Valores distintos de una columna, para su filtro tipo lista. */
  opcionesLista(columna: ColumnaTabla): string[] {
    const valores = new Set<string>();
    this.filas.forEach((f) => {
      const t = this.texto(f, columna);
      if (t) {
        valores.add(t);
      }
    });
    return Array.from(valores).sort((a, b) => a.localeCompare(b, 'es'));
  }

  /** Indica si una columna se puede ordenar. */
  esOrdenable(columna: ColumnaTabla): boolean {
    return columna.ordenable !== false;
  }

  /** Símbolo de orden que se dibuja junto al encabezado. */
  flecha(columna: ColumnaTabla): string {
    if (this.orden.ruta !== columna.ruta) {
      return '↕';
    }
    return this.orden.direccion === 'asc' ? '▲' : '▼';
  }

  /**
   * Ordena por una columna; si ya estaba ordenada por ella invierte la dirección.
   * @param columna columna pulsada.
   */
  ordenar(columna: ColumnaTabla): void {
    if (!this.esOrdenable(columna)) {
      return;
    }
    if (this.orden.ruta === columna.ruta) {
      this.orden = { ruta: columna.ruta, direccion: this.orden.direccion === 'asc' ? 'desc' : 'asc' };
    } else {
      this.orden = { ruta: columna.ruta, direccion: 'asc' };
    }
    this.recalcular();
  }

  /** Se ejecuta cuando cambia cualquier filtro: vuelve a la primera página y recalcula. */
  alCambiarFiltro(): void {
    this.pagina = 1;
    this.recalcular();
  }

  /**
   * Establece el filtro de una columna.
   * @param id id de la columna.
   * @param valor valor escrito o seleccionado.
   */
  establecerFiltro(id: string, valor: string): void {
    this.filtrosColumna[id] = valor;
    this.alCambiarFiltro();
  }

  /** Limpia todos los filtros. */
  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtrosColumna = {};
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.alCambiarFiltro();
  }

  /** Indica si hay algún filtro activo. */
  get hayFiltros(): boolean {
    return !!(this.busqueda || this.fechaDesde || this.fechaHasta || Object.values(this.filtrosColumna).some((v) => !!v));
  }

  /** Cambia la página actual. */
  alCambiarPagina(pagina: number): void {
    this.pagina = pagina;
    this.actualizarPagina();
  }

  /** Cambia el tamaño de página y vuelve a la primera. */
  alCambiarTamano(tamano: number): void {
    this.tamanoPagina = Number(tamano);
    this.pagina = 1;
    this.actualizarPagina();
  }

  /** Aplica filtros y orden sobre las filas y actualiza la página mostrada. */
  private recalcular(): void {
    const filtradas = (this.filas ?? []).filter((f) => this.coincide(f));
    if (this.orden.ruta) {
      const factor = this.orden.direccion === 'asc' ? 1 : -1;
      filtradas.sort((a, b) => factor * this.comparar(this.valor(a, this.orden.ruta), this.valor(b, this.orden.ruta)));
    }
    this.filasFiltradas = filtradas;
    const totalPaginas = Math.max(1, Math.ceil(filtradas.length / this.tamanoPagina));
    if (this.pagina > totalPaginas) {
      this.pagina = totalPaginas;
    }
    this.actualizarPagina();
  }

  /** Recorta las filas filtradas a la página actual. */
  private actualizarPagina(): void {
    const inicio = (this.pagina - 1) * this.tamanoPagina;
    this.filasPagina = this.filasFiltradas.slice(inicio, inicio + this.tamanoPagina);
  }

  /** Indica si una fila cumple todos los filtros activos. */
  private coincide(fila: any): boolean {
    const q = this.normalizar(this.busqueda);
    if (q && !this.columnas.some((c) => this.normalizar(this.texto(fila, c)).includes(q))) {
      return false;
    }
    for (const c of this.columnas) {
      const filtro = this.filtrosColumna[c.id];
      if (!filtro) {
        continue;
      }
      const t = this.texto(fila, c);
      const cumple = c.filtro === 'lista' ? t === filtro : this.normalizar(t).includes(this.normalizar(filtro));
      if (!cumple) {
        return false;
      }
    }
    if (this.rutaFiltroFechas && (this.fechaDesde || this.fechaHasta)) {
      const fecha = String(this.valor(fila, this.rutaFiltroFechas) ?? '').substring(0, 10);
      if (this.fechaDesde && fecha < this.fechaDesde) {
        return false;
      }
      if (this.fechaHasta && fecha > this.fechaHasta) {
        return false;
      }
    }
    return true;
  }

  /** Compara dos valores (números como números, texto sin distinguir acentos ni mayúsculas). */
  private comparar(a: any, b: any): number {
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    return String(a ?? '').localeCompare(String(b ?? ''), 'es', { numeric: true, sensitivity: 'base' });
  }

  /** Pasa a minúsculas y quita acentos para comparar texto. */
  private normalizar(texto: string): string {
    return (texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  /** Primera letra en mayúscula y el resto en minúscula (PENDIENTE → Pendiente). */
  private capitalizar(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  }
}
