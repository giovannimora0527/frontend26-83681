import { Component, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';
import { Orden } from 'src/app/models/pagina';

/**
 * Encabezado de columna ordenable para los DataTables. Se usa como atributo
 * de un th: {@code <th appOrdenable="fecha" [orden]="orden" (ordenar)="ordenarPor($event)">Fecha</th>}.
 * Al hacer clic emite la columna y muestra una flecha con la dirección actual.
 */
@Component({
  // Selector de atributo a propósito: debe ser el mismo <th> para no romper la estructura de la tabla.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'th[appOrdenable]',
  template: `<span class="d-inline-flex align-items-center gap-1">
      <ng-content></ng-content>
      <i class="fa" [class.fa-sort]="!activa" [class.text-muted]="!activa"
        [class.fa-sort-up]="activa && orden.direccion === 'asc'"
        [class.fa-sort-down]="activa && orden.direccion === 'desc'" aria-hidden="true"></i>
    </span>`,
  styles: [':host { cursor: pointer; user-select: none; white-space: nowrap; }']
})
export class ColumnaOrdenableComponent {
  /** Llave de la columna que entiende el backend (por ejemplo "fecha"). */
  @Input({ required: true }) appOrdenable!: string;
  /** Orden actual de la tabla. */
  @Input({ required: true }) orden!: Orden;
  /** Se emite con la columna cuando el usuario hace clic. */
  @Output() ordenar = new EventEmitter<string>();

  /** Indica si la tabla está ordenada por esta columna. */
  get activa(): boolean {
    return this.orden?.columna === this.appOrdenable;
  }

  /** Atributo de accesibilidad que anuncia el orden actual. */
  @HostBinding('attr.aria-sort')
  get ariaSort(): string {
    if (!this.activa) {
      return 'none';
    }
    return this.orden.direccion === 'asc' ? 'ascending' : 'descending';
  }

  /** Emite la columna al hacer clic en el encabezado. */
  @HostListener('click')
  alHacerClic(): void {
    this.ordenar.emit(this.appOrdenable);
  }
}
