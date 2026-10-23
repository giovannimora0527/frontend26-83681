import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CLASES_ESTADO } from 'src/app/models/estados';
import { FormulaDetalle } from 'src/app/models/formula-medica';

/**
 * Modal "Ver": muestra TODOS los datos de una fórmula médica (el listado solo muestra un resumen).
 */
@Component({
  selector: 'app-formula-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './formula-detalle.component.html'
})
export class FormulaDetalleComponent {

  /** Fórmula con todos sus campos. */
  @Input({ required: true }) formula!: FormulaDetalle;

  constructor(public modal: NgbActiveModal) { }

  /** Clase CSS de la insignia del estado. */
  get claseEstado(): string {
    return CLASES_ESTADO[this.formula.estado] ?? 'bg-secondary';
  }
}
