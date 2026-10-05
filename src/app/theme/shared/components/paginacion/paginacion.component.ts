import { Component, input } from '@angular/core';
import { TablaPaginada } from '../../helpers/tabla-paginada';

@Component({
  selector: 'app-paginacion',
  template: `
    @if (tabla().totalPaginas > 1) {
      <nav [attr.aria-label]="etiqueta()">
        <ul class="pagination justify-content-end mb-0">
          <li class="page-item" [class.disabled]="tabla().paginaActual === 1">
            <button class="page-link" type="button" [disabled]="tabla().paginaActual === 1"
              (click)="tabla().cambiarPagina(tabla().paginaActual - 1)">Anterior</button>
          </li>
          @for (pagina of tabla().paginas; track pagina) {
            <li class="page-item" [class.active]="pagina === tabla().paginaActual">
              <button class="page-link" type="button" [attr.aria-current]="pagina === tabla().paginaActual ? 'page' : null"
                (click)="tabla().cambiarPagina(pagina)">{{ pagina }}</button>
            </li>
          }
          <li class="page-item" [class.disabled]="tabla().paginaActual === tabla().totalPaginas">
            <button class="page-link" type="button" [disabled]="tabla().paginaActual === tabla().totalPaginas"
              (click)="tabla().cambiarPagina(tabla().paginaActual + 1)">Siguiente</button>
          </li>
        </ul>
      </nav>
    }
  `
})
export class PaginacionComponent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly tabla = input.required<TablaPaginada<any>>();
  readonly etiqueta = input('Paginación');
}
