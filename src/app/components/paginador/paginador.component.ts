import { Component, computed, input, output } from '@angular/core';

/**
 * Controles de paginación reutilizables para todos los DataTable.
 * La página es base 0, igual que en el backend.
 */
@Component({
  selector: 'app-paginador',
  standalone: true,
  template: `
    @if (totalPaginas() > 1) {
      <nav aria-label="Paginación del listado">
        <ul class="pagination pagination-sm justify-content-center flex-wrap mb-0">
          <li class="page-item" [class.disabled]="pagina() === 0">
            <button class="page-link" type="button" (click)="irA(pagina() - 1)">Anterior</button>
          </li>
          @for (p of paginas(); track p) {
            <li class="page-item" [class.active]="p === pagina()">
              <button class="page-link" type="button" (click)="irA(p)">{{ p + 1 }}</button>
            </li>
          }
          <li class="page-item" [class.disabled]="pagina() >= totalPaginas() - 1">
            <button class="page-link" type="button" (click)="irA(pagina() + 1)">Siguiente</button>
          </li>
        </ul>
      </nav>
    }
  `
})
export class PaginadorComponent {
  /** Página actual (desde 0). */
  pagina = input.required<number>();

  /** Total de páginas disponibles. */
  totalPaginas = input.required<number>();

  /** Emite la página solicitada por el usuario. */
  cambiarPagina = output<number>();

  /** Ventana de hasta 5 números de página alrededor de la actual. */
  paginas = computed(() => {
    const total = this.totalPaginas();
    const inicio = Math.max(0, Math.min(this.pagina() - 2, total - 5));
    const fin = Math.min(total, inicio + 5);
    return Array.from({ length: Math.max(0, fin - inicio) }, (_, i) => inicio + i);
  });

  /**
   * Solicita una página válida distinta de la actual.
   *
   * @param p página destino (base 0).
   */
  irA(p: number): void {
    if (p >= 0 && p < this.totalPaginas() && p !== this.pagina()) {
      this.cambiarPagina.emit(p);
    }
  }
}
