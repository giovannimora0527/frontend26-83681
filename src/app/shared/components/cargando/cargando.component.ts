import { Component, Input } from '@angular/core';

/**
 * Indicador de carga reutilizable (spinner con texto).
 */
@Component({
  selector: 'app-cargando',
  template: `<div class="d-flex justify-content-center align-items-center gap-2 py-3 text-muted" role="status">
      <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
      <span>{{ mensaje }}</span>
    </div>`
})
export class CargandoComponent {
  /** Texto que acompaña al spinner. */
  @Input() mensaje = 'Cargando...';
}
