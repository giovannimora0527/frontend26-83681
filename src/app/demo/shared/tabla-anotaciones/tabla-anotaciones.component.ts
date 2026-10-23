import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnotacionHistoria } from 'src/app/models/anotacion-historia';
import { TablaDatos } from 'src/app/utils/tabla-datos';
import { PaginadorComponent } from '../paginador/paginador.component';

/**
 * Componente reutilizable que muestra el historico de anotaciones en un DataTable:
 * filtro, ordenamiento por fecha, paginacion y detalle de una anotacion.
 * Se usa en el modal "Ver" de historia clinica y en la pagina de anotaciones.
 */
@Component({
  selector: 'app-tabla-anotaciones',
  imports: [CommonModule, FormsModule, PaginadorComponent],
  templateUrl: './tabla-anotaciones.component.html'
})
export class TablaAnotacionesComponent {

  /** Tabla con filtro, orden y paginacion. Inicia de la mas reciente a la mas antigua. */
  tabla = new TablaDatos<AnotacionHistoria>(
    (a, columna) => columna === 'fecha' ? a.fecha
      : columna === 'veterinario' ? `${a.medico?.nombres} ${a.medico?.apellidos}`
      : columna === 'mascota' ? a.historia?.mascota?.nombreMascota
      : a.descripcion,
    a => `${a.descripcion} ${a.observacion ?? ''} ${a.diagnostico ?? ''} ${a.medico?.nombres} ${a.medico?.apellidos}`
  );

  /** Anotacion seleccionada para ver su detalle. */
  anotacionSeleccionada: AnotacionHistoria | null = null;

  /** Si es true, muestra la columna "Historia" (util cuando se ve el historial de toda la mascota). */
  @Input() mostrarHistoria = false;

  constructor() {
    this.tabla.columnaOrden = 'fecha';
    this.tabla.direccionOrden = 'desc';
  }

  /** Recibe la lista de anotaciones desde el componente padre. */
  @Input() set anotaciones(lista: AnotacionHistoria[]) {
    this.tabla.setDatos(lista);
    this.anotacionSeleccionada = null;
  }

  /** Muestra el detalle completo de una anotacion. */
  verDetalle(anotacion: AnotacionHistoria): void {
    this.anotacionSeleccionada = anotacion;
  }
}
