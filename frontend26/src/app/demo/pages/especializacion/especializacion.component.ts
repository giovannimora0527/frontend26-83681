import { Component } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Modal } from 'bootstrap';
import Swal from 'sweetalert2';

import { Especializacion } from 'src/app/models/especializacion';
import { EspecializacionService } from './service/especializacion.service';

type ColumnaOrden = 'codigo' | 'nombre' | 'descripcion';

/**
 * Componente de gestión de especializaciones: listado paginado con búsqueda y ordenamiento,
 * creación y edición mediante un modal con formulario reactivo.
 */
@Component({
  selector: 'app-especializacion',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbTooltipModule],
  templateUrl: './especializacion.component.html',
  styleUrl: './especializacion.component.scss'
})
export class EspecializacionComponent {
  // Variables para el modal.
  modalInstance: Modal | null = null;
  titleModal: string = '';
  modoFormulario: string = '';
  titleBoton: string = '';

  // Variables para la paginación, ordenamiento y búsqueda en la datatable.
  listEspecializaciones: Especializacion[] = [];
  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 10;
  columnaOrden: ColumnaOrden = 'nombre';
  direccionOrden: 'asc' | 'desc' = 'asc';
  cargando = false;
  errorLista = '';

  // Formulario para crear o editar especialización.
  form!: FormGroup;
  especializacionSelected: Especializacion | null = null;
  enviando = false;
  respuestaError = '';

  constructor(
    private readonly especializacionService: EspecializacionService,
    private readonly formBuilder: FormBuilder
  ) {
    this.inicializarFormulario();
    this.listar();
  }

  /** Inicializa el formulario con sus controles y validaciones. */
  inicializarFormulario(): void {
    this.form = this.formBuilder.group({
      codigoEspecializacion: ['', [Validators.required, Validators.maxLength(10)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['']
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  /** Filtra y ordena según el término de búsqueda y la columna activa. */
  get especializacionesFiltradas(): Especializacion[] {
    const termino = this.normalizarTexto(this.terminoBusqueda.trim());
    const filtradas = this.listEspecializaciones.filter((especializacion) => {
      if (!termino) {
        return true;
      }
      const valores = [
        especializacion.codigoEspecializacion,
        especializacion.nombre,
        especializacion.descripcion
      ];
      return valores.some((valor) => this.normalizarTexto(String(valor ?? '')).includes(termino));
    });

    return [...filtradas].sort((a, b) => {
      const valorA = this.obtenerValorOrden(a, this.columnaOrden);
      const valorB = this.obtenerValorOrden(b, this.columnaOrden);
      const comparacion = typeof valorA === 'number' && typeof valorB === 'number'
        ? valorA - valorB
        : String(valorA).localeCompare(String(valorB), 'es', { numeric: true, sensitivity: 'base' });
      return this.direccionOrden === 'asc' ? comparacion : -comparacion;
    });
  }

  private obtenerValorOrden(especializacion: Especializacion, columna: ColumnaOrden): string | number {
    switch (columna) {
      case 'codigo':
        return especializacion.codigoEspecializacion ?? '';
      case 'nombre':
        return especializacion.nombre ?? '';
      case 'descripcion':
        return especializacion.descripcion ?? '';
    }
  }

  ordenarPor(columna: ColumnaOrden): void {
    if (this.columnaOrden === columna) {
      this.direccionOrden = this.direccionOrden === 'asc' ? 'desc' : 'asc';
    } else {
      this.columnaOrden = columna;
      this.direccionOrden = 'asc';
    }
    this.paginaActual = 1;
  }

  get especializacionesPaginadas(): Especializacion[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.especializacionesFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.especializacionesFiltradas.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, indice) => indice + 1);
  }

  /** Lista los registros de la base de datos y los muestra en la tabla. */
  listar(): void {
    this.cargando = true;
    this.errorLista = '';
    this.especializacionService.listarEspecializaciones().subscribe({
      next: (data) => {
        this.listEspecializaciones = data ?? [];
        this.paginaActual = 1;
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        this.errorLista = this.mensajeError(error, 'No fue posible cargar los especializaciones.');
      }
    });
  }

  // Actualiza el término de búsqueda y reinicia la página actual a 1.
  actualizarBusqueda(event: Event): void {
    this.terminoBusqueda = (event.target as HTMLInputElement).value;
    this.paginaActual = 1;
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  // Normaliza el texto eliminando acentos y convirtiendo a minúsculas.
  private normalizarTexto(texto: string): string {
    return texto
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /** Abre el modal en modo creación ('C'). */
  nuevaEspecializacion(modo: string): void {
    this.modoFormulario = modo;
    this.especializacionSelected = null;
    this.resetFormulario();
    this.openModal(modo);
  }

  resetFormulario(): void {
    this.form.reset({ codigoEspecializacion: '', nombre: '', descripcion: '' });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.respuestaError = '';
  }

  /** Abre el modal en modo edición con los datos del registro seleccionado. */
  abrirEdicion(especializacion: Especializacion): void {
    this.especializacionSelected = especializacion;
    this.modoFormulario = 'E';
    this.respuestaError = '';
    this.form.reset({
      codigoEspecializacion: especializacion.codigoEspecializacion ?? '',
      nombre: especializacion.nombre ?? '',
      descripcion: especializacion.descripcion ?? ''
    });
    this.openModal(this.modoFormulario);
  }

  /** Crea o actualiza el registro según el modo del formulario. */
  guardarEspecializacion(): void {
    if (this.form.invalid || this.enviando) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const especializacion: Especializacion = {
      id: this.especializacionSelected?.id,
      codigoEspecializacion: String(valores.codigoEspecializacion).trim(),
      nombre: String(valores.nombre).trim(),
      descripcion: String(valores.descripcion ?? '').trim()
    };

    this.enviando = true;
    this.respuestaError = '';
    const solicitud = this.modoFormulario === 'C'
      ? this.especializacionService.crearEspecializacion(especializacion)
      : this.especializacionService.actualizarEspecializacion(especializacion);

    solicitud.subscribe({
      next: (respuesta) => {
        this.enviando = false;
        const mensaje = this.obtenerMensajeRespuesta(
          respuesta,
          this.modoFormulario === 'C' ? 'La especialización fue creada correctamente.' : 'La especialización fue actualizada correctamente.'
        );
        this.closeModal();
        this.listar();
        Swal.fire('Operación exitosa', mensaje, 'success');
      },
      error: (error) => {
        this.enviando = false;
        this.respuestaError = this.mensajeError(error, 'No fue posible guardar la especialización.');
      }
    });
  }

  private obtenerMensajeRespuesta(respuesta: unknown, mensajePredeterminado: string): string {
    if (respuesta && typeof respuesta === 'object') {
      const cuerpo = respuesta as { mensaje?: unknown; message?: unknown };
      const mensaje = cuerpo.mensaje ?? cuerpo.message;
      if (typeof mensaje === 'string') {
        return mensaje;
      }
    }
    return mensajePredeterminado;
  }

  /** Extrae un mensaje comprensible del error devuelto por el backend. */
  private mensajeError(error: unknown, predeterminado: string): string {
    if (error && typeof error === 'object') {
      const respuesta = error as { status?: number; error?: { message?: unknown } };
      if (respuesta.status === 0) {
        return 'No fue posible comunicarse con el servidor. Intenta de nuevo más tarde.';
      }
      const mensaje = respuesta.error?.message;
      if (typeof mensaje === 'string' && mensaje.trim()) {
        return mensaje;
      }
    }
    return predeterminado;
  }

  closeModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.resetFormulario();
  }

  openModal(modo: string): void {
    this.titleModal = modo === 'C' ? 'Crear Especialización' : 'Editar Especialización';
    this.titleBoton = modo === 'C' ? 'Guardar Especialización' : 'Actualizar Especialización';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearEspecializacion');
    if (modalElement) {
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }
}
