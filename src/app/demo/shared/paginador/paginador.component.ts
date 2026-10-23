import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { TablaDatos } from 'src/app/utils/tabla-datos';

/**
 * Componente reutilizable con el pie de tabla:
 * "Mostrando X a Y de Z", selector de registros por pagina y paginador.
 * Uso: <app-paginador [tabla]="tablaCitas" nombre="citas"></app-paginador>
 */
@Component({
  selector: 'app-paginador',
  imports: [CommonModule, FormsModule, NgbPaginationModule],
  templateUrl: './paginador.component.html'
})
export class PaginadorComponent {

  /** Tabla (TablaDatos) a la que pertenece el paginador. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input({ required: true }) tabla!: TablaDatos<any>;

  /** Nombre de los registros para el texto (ej: "citas"). */
  @Input() nombre = 'registros';
}
