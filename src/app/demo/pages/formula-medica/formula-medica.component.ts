import { Component } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FormulaMedicaService } from './service/formula-medica.service';
import { FormulaMedica } from 'src/app/models/formula-medica';
import { MedicamentoService } from '../medicamento/service/medicamento.service';
import { Medicamento } from 'src/app/models/medicamento';

@Component({
  selector: 'app-formula-medica',
  imports: [CommonModule, FormsModule],
  templateUrl: './formula-medica.component.html',
  styleUrl: './formula-medica.component.scss'
})
export class FormulaMedicaComponent {
  // Orden por fecha de creacion: false = mas recientes primero.
  ordenAscendente = false;

  // Variables para la paginación y búsqueda en la datatable.
  listFormulas: FormulaMedica[] = [];
  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 10;

  // La formula solo trae medicamentoId; este mapa permite mostrar el nombre del medicamento.
  medicamentosPorId = new Map<number, Medicamento>();

  constructor(private readonly formulaMedicaService: FormulaMedicaService,
    private readonly medicamentoService: MedicamentoService) {
    this.cargarMedicamentos();
    this.listar();
  }

  cargarMedicamentos() {
    this.medicamentoService.getMedicamentos().subscribe({
      next: (data) => this.medicamentosPorId = new Map(data.map((medicamento) => [medicamento.id!, medicamento])),
      error: (error) => console.error('Error al obtener los medicamentos:', error)
    });
  }

  // Devuelve "Nombre (presentacion)" o "#id" si el medicamento no esta en el catalogo.
  nombreMedicamento(medicamentoId?: number): string {
    const medicamento = medicamentoId != null ? this.medicamentosPorId.get(medicamentoId) : undefined;
    return medicamento ? `${medicamento.nombre} (${medicamento.presentacion})` : `#${medicamentoId ?? ''}`;
  }

  /**
   * Metodo que permite listar las formulas medicas ordenadas por fecha de creacion.
   */
  listar() {
    this.formulaMedicaService.getFormulasOrdenadas(this.ordenAscendente)
      .subscribe({
        next: (data) => {
          this.listFormulas = data;
          this.paginaActual = 1;
        },
        error: (error) => {
          console.error('Error al obtener las fórmulas médicas:', error);
        }
      });
  }

  /**
   * Filtra la lista de formulas segun el termino de busqueda.
   * La fecha se compara como yyyy-MM-dd HH:mm para poder buscar, por ejemplo, "2026-10-04".
   */
  get formulasFiltradas(): FormulaMedica[] {
    const termino = this.normalizarTexto(this.terminoBusqueda);
    if (!termino) {
      return this.listFormulas;
    }

    return this.listFormulas.filter((formula) => {
      const valores = [
        formula.citaId,
        this.nombreMedicamento(formula.medicamentoId),
        formula.dosis,
        formula.indicaciones,
        formula.fechaCreacionRegistro
          ? formatDate(formula.fechaCreacionRegistro, 'yyyy-MM-dd HH:mm', 'en-US')
          : ''
      ];

      return valores.some((valor) =>
        this.normalizarTexto(String(valor ?? '')).includes(termino)
      );
    });
  }

  get formulasPaginadas(): FormulaMedica[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.formulasFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.formulasFiltradas.length / this.registrosPorPagina);
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

  // Metodo privado para normalizar el texto, eliminando acentos y convirtiendo a minúsculas.
  private normalizarTexto(texto: string): string {
    return texto
      .trim()
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }
}
