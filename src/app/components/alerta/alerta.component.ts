import { Component, input } from '@angular/core';

/**
 * Mensaje de éxito, advertencia o error. Si no hay mensaje, no muestra nada.
 */
@Component({
  selector: 'app-alerta',
  standalone: true,
  template: `
    @if (mensaje()) {
      <div class="alert alert-{{ tipo() }} py-2 mb-3" role="alert">{{ mensaje() }}</div>
    }
  `
})
export class AlertaComponent {
  /** Texto a mostrar; null o vacío oculta la alerta. */
  mensaje = input<string | null>(null);

  /** Tipo de alerta de Bootstrap. */
  tipo = input<'success' | 'danger' | 'warning' | 'info'>('info');
}
