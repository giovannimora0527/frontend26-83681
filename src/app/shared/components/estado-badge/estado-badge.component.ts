import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

/**
 * Etiqueta de color para los estados de citas, historias y fórmulas,
 * para que el mismo estado se vea igual en todas las pantallas.
 */
@Component({
  selector: 'app-estado-badge',
  imports: [NgClass],
  template: `<span class="badge" [ngClass]="clase">{{ texto }}</span>`
})
export class EstadoBadgeComponent {
  /** Estado a mostrar (PENDIENTE, ATENDIDA, ABIERTA, ACTIVA...). */
  @Input({ required: true }) estado!: string;

  /** Colores por estado. */
  private static readonly CLASES: Record<string, string> = {
    PENDIENTE: 'bg-warning text-dark',
    PROGRAMADA: 'bg-info text-dark',
    CONFIRMADA: 'bg-primary',
    ATENDIDA: 'bg-success',
    CANCELADA: 'bg-danger',
    ABIERTA: 'bg-primary',
    CERRADA: 'bg-secondary',
    ACTIVA: 'bg-success',
    INACTIVA: 'bg-secondary'
  };

  /** Clase CSS del estado. */
  get clase(): string {
    return EstadoBadgeComponent.CLASES[this.estado] ?? 'bg-secondary';
  }

  /** Texto del estado con solo la primera letra en mayúscula. */
  get texto(): string {
    return this.estado ? this.estado.charAt(0) + this.estado.slice(1).toLowerCase() : '';
  }
}
