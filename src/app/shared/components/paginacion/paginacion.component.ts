import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Barra de paginación reutilizable para los DataTables.
 * Muestra el rango de registros visibles, el selector de tamaño de página y
 * los botones de páginas. Trabaja con páginas que empiezan en 0 (como el backend).
 */
@Component({
  selector: 'app-paginacion',
  imports: [CommonModule],
  templateUrl: './paginacion.component.html'
})
export class PaginacionComponent {
  /** Página actual (empieza en 0). */
  @Input() pagina = 0;
  /** Total de páginas. */
  @Input() totalPaginas = 0;
  /** Total de registros. */
  @Input() totalRegistros = 0;
  /** Registros por página. */
  @Input() tamanio = 10;
  /** Opciones del selector de tamaño de página. */
  @Input() opcionesTamanio = [5, 10, 20, 50];

  /** Se emite con la nueva página seleccionada. */
  @Output() paginaCambiada = new EventEmitter<number>();
  /** Se emite con el nuevo tamaño de página. */
  @Output() tamanioCambiado = new EventEmitter<number>();

  /** Cantidad máxima de botones de página visibles. */
  private readonly botonesVisibles = 5;

  /** Número (desde 1) del primer registro visible. */
  get desde(): number {
    return this.totalRegistros === 0 ? 0 : this.pagina * this.tamanio + 1;
  }

  /** Número del último registro visible. */
  get hasta(): number {
    return Math.min((this.pagina + 1) * this.tamanio, this.totalRegistros);
  }

  /**
   * Páginas que se muestran como botones, centradas en la página actual.
   * @returns Lista de índices de página (empiezan en 0).
   */
  get paginasVisibles(): number[] {
    const inicio = Math.max(0, Math.min(this.pagina - Math.floor(this.botonesVisibles / 2),
      this.totalPaginas - this.botonesVisibles));
    const fin = Math.min(this.totalPaginas, inicio + this.botonesVisibles);
    return Array.from({ length: fin - inicio }, (_, indice) => inicio + indice);
  }

  /**
   * Solicita ir a una página, si es válida y distinta de la actual.
   * @param pagina Página destino (empieza en 0).
   */
  irA(pagina: number): void {
    if (pagina >= 0 && pagina < this.totalPaginas && pagina !== this.pagina) {
      this.paginaCambiada.emit(pagina);
    }
  }

  /**
   * Notifica el cambio de tamaño de página.
   * @param evento Evento change del select.
   */
  cambiarTamanio(evento: Event): void {
    this.tamanioCambiado.emit(Number((evento.target as HTMLSelectElement).value));
  }
}
