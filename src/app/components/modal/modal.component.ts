import { Component, input, output } from '@angular/core';

/**
 * Ventana modal sencilla con contenido proyectado. Se usa para formularios y para el detalle "Ver".
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (visible()) {
      <div class="modal-fondo" (click)="cerrar.emit()">
        <div class="card modal-caja" role="dialog" aria-modal="true" [attr.aria-label]="titulo()" (click)="$event.stopPropagation()">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">{{ titulo() }}</h5>
            <button type="button" class="btn-close" aria-label="Cerrar" (click)="cerrar.emit()"></button>
          </div>
          <div class="card-body">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-fondo {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 2rem 1rem;
      overflow-y: auto;
      z-index: 1055;
    }
    .modal-caja {
      width: 100%;
      max-width: 900px;
    }
  `]
})
export class ModalComponent {
  /** Controla si la ventana está visible. */
  visible = input.required<boolean>();

  /** Título mostrado en la cabecera. */
  titulo = input.required<string>();

  /** Se emite cuando el usuario cierra la ventana. */
  cerrar = output<void>();
}
