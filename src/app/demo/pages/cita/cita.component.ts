import { Component } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CitaService } from './service/cita.service';
import { Cita } from 'src/app/models/cita';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-cita',
  imports: [CommonModule, FormsModule],
  templateUrl: './cita.component.html',
  styleUrl: './cita.component.scss'
})
export class CitaComponent {
  // Rango de fechas del filtro (yyyy-MM-dd, que es el formato del input type="date").
  fechaInicio: string;
  fechaFinal: string;

  // Variables para la paginación y búsqueda en la datatable.
  listCitas: Cita[] = [];
  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 10;

  constructor(private readonly citaService: CitaService) {
    // Por defecto se muestran las citas del mes actual.
    const hoy = new Date();
    this.fechaInicio = formatDate(new Date(hoy.getFullYear(), hoy.getMonth(), 1), 'yyyy-MM-dd', 'en-US');
    this.fechaFinal = formatDate(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0), 'yyyy-MM-dd', 'en-US');
    this.filtrar();
  }

  /**
   * Consulta en el backend las citas cuya fecha está dentro del rango seleccionado.
   * El día final se incluye completo (hasta las 23:59:59).
   */
  filtrar() {
    if (!this.fechaInicio || !this.fechaFinal) {
      Swal.fire('Fechas incompletas', 'Seleccione la fecha inicial y la fecha final.', 'warning');
      return;
    }
    if (this.fechaInicio > this.fechaFinal) {
      Swal.fire('Rango inválido', 'La fecha inicial no puede ser mayor que la fecha final.', 'warning');
      return;
    }

    this.citaService.filtrarPorFechas(`${this.fechaInicio}T00:00:00`, `${this.fechaFinal}T23:59:59`)
      .subscribe({
        next: (data) => {
          this.listCitas = data;
          this.paginaActual = 1;
        },
        error: (error) => {
          console.error('Error al obtener las citas:', error);
          Swal.fire('Error', error?.error?.message ?? 'No fue posible consultar las citas.', 'error');
        }
      });
  }

  /**
   * Filtra las citas ya consultadas según el término de búsqueda.
   * La fecha se compara como yyyy-MM-dd HH:mm para poder buscar, por ejemplo, "2026-10-04".
   */
  get citasFiltradas(): Cita[] {
    const termino = this.normalizarTexto(this.terminoBusqueda);
    if (!termino) {
      return this.listCitas;
    }

    return this.listCitas.filter((cita) => {
      const valores = [
        cita.mascota?.nombreMascota,
        `${cita.mascota?.cliente?.nombres ?? ''} ${cita.mascota?.cliente?.apellidos ?? ''}`,
        `${cita.medico?.nombres ?? ''} ${cita.medico?.apellidos ?? ''}`,
        cita.estado,
        cita.motivo,
        cita.fechaHora ? formatDate(cita.fechaHora, 'yyyy-MM-dd HH:mm', 'en-US') : ''
      ];

      return valores.some((valor) =>
        this.normalizarTexto(String(valor ?? '')).includes(termino)
      );
    });
  }

  get citasPaginadas(): Cita[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.citasFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.citasFiltradas.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, indice) => indice + 1);
  }

  // Metodo que actualiza el termino de busqueda y reinicia la pagina actual a 1.
  actualizarBusqueda(event: Event) {
    this.terminoBusqueda = (event.target as HTMLInputElement).value;
    this.paginaActual = 1;
  }

  // Cambia paginacion.
  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  // Color del badge segun el estado de la cita.
  claseEstado(estado?: string): string {
    switch ((estado ?? '').toUpperCase()) {
      case 'PROGRAMADA': return 'bg-primary';
      case 'ATENDIDA':
      case 'COMPLETADA': return 'bg-success';
      case 'CANCELADA': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  // Metodo privado para normalizar el texto, eliminando acentos y convirtiendo a minúsculas.
  private normalizarTexto(texto: string): string {
    return texto
      .trim()
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }
}
