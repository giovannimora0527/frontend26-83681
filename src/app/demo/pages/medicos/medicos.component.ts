import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicosServiceService } from './service/medicos-service.service';
import { Medico } from 'src/app/models/medico';
import { TablaDatos } from 'src/app/utils/tabla-datos';
import { mostrarError } from 'src/app/utils/mensajes.util';
import { PaginadorComponent } from '../../shared/paginador/paginador.component';

/**
 * Pantalla de consulta de veterinarios (listado con filtro, orden y paginacion).
 */
@Component({
  selector: 'app-medicos',
  imports: [CommonModule, FormsModule, PaginadorComponent],
  templateUrl: './medicos.component.html',
  styleUrl: './medicos.component.scss'
})
export class MedicosComponent {

  /** DataTable de veterinarios. */
  tabla = new TablaDatos<Medico>(
    (m, columna) => columna === 'documento' ? m.numeroDocumento
      : columna === 'nombre' ? `${m.nombres} ${m.apellidos}`
      : columna === 'registro' ? m.registroProfesional
      : m.especializacion?.nombre,
    m => `${m.numeroDocumento} ${m.nombres} ${m.apellidos} ${m.registroProfesional} ${m.especializacion?.nombre}`
  );

  cargando = false;

  constructor(private readonly medicoService: MedicosServiceService) {
    this.tabla.columnaOrden = 'nombre';
    this.tabla.direccionOrden = 'asc';
    this.cargando = true;
    this.medicoService.getMedicos().subscribe({
      next: (data) => {
        this.tabla.setDatos(data);
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        mostrarError(error);
      }
    });
  }
}
