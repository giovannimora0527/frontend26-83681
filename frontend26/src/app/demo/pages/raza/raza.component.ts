import { Component } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Modal } from 'bootstrap';
import Swal from 'sweetalert2';

import { Raza } from 'src/app/models/raza';
import { RazaService } from './service/raza.service';

type ColumnaOrden = 'nombre' | 'especie' | 'fechaCreacion';

/**
 * Componente de gestión de razas: listado paginado con búsqueda y ordenamiento,
 * creación y edición mediante un modal con formulario reactivo.
 */
@Component({
  selector: 'app-raza',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbTooltipModule],
  templateUrl: './raza.component.html',
  styleUrl: './raza.component.scss'
})
export class RazaComponent {
  // Variables para el modal.
  modalInstance: Modal | null = null;
  titleModal: string = '';
  modoFormulario: string = '';
  titleBoton: string = '';

  // Variables para la paginación, ordenamiento y búsqueda en la datatable.
  listRazas: Raza[] = [];
  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 10;
  columnaOrden: ColumnaOrden = 'nombre';
  direccionOrden: 'asc' | 'desc' = 'asc';
  cargando = false;
  errorLista = '';

  /** Sugerencias de especies para facilitar la digitación. */
  readonly especiesSugeridas = ['Canino', 'Felino', 'Ave', 'Roedor', 'Reptil'];

  // Formulario para crear o editar raza.
  form!: FormGroup;
  razaSelected: Raza | null = null;
  enviando = false;
  respuestaError = '';

  constructor(
    private readonly razaService: RazaService,
    private readonly formBuilder: FormBuilder
  ) {
    this.inicializarFormulario();
    this.listar();
  }

  /** Inicializa el formulario con sus controles y validaciones. */
  inicializarFormulario(): void {
    this.form = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      especie: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  /** Filtra y ordena las razas según el término de búsqueda y la columna activa. */
  get razasFiltradas(): Raza[] {
    const termino = this.normalizarTexto(this.terminoBusqueda.trim());
    const filtradas = this.listRazas.filter((raza) => {
      if (!termino) {
        return true;
      }
      const valores = [
        raza.nombre,
        raza.especie,
        raza.fechaCreacion ? formatDate(raza.fechaCreacion, 'yyyy-MM-dd HH:mm', 'en-US') : ''
      ];
      return valores.some((valor) => this.normalizarTexto(String(valor ?? '')).includes(termino));
    });

    return [...filtradas].sort((razaA, razaB) => {
      const valorA = this.obtenerValorOrden(razaA, this.columnaOrden);
      const valorB = this.obtenerValorOrden(razaB, this.columnaOrden);
      const comparacion = typeof valorA === 'number' && typeof valorB === 'number'
        ? valorA - valorB
        : String(valorA).localeCompare(String(valorB), 'es', { numeric: true, sensitivity: 'base' });
      return this.direccionOrden === 'asc' ? comparacion : -comparacion;
    });
  }

  private obtenerValorOrden(raza: Raza, columna: ColumnaOrden): string | number {
    switch (columna) {
      case 'nombre':
        return raza.nombre ?? '';
      case 'especie':
        return raza.especie ?? '';
      case 'fechaCreacion':
        return raza.fechaCreacion ? new Date(raza.fechaCreacion).getTime() : 0;
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

  get razasPaginadas(): Raza[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.razasFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.razasFiltradas.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, indice) => indice + 1);
  }

  /** Lista las razas registradas en la base de datos y las muestra en la tabla. */
  listar(): void {
    this.cargando = true;
    this.errorLista = '';
    this.razaService.listarRazas().subscribe({
      next: (data) => {
        this.listRazas = data ?? [];
        this.paginaActual = 1;
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        this.errorLista = this.mensajeError(error, 'No fue posible cargar las razas.');
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
  nuevaRaza(modo: string): void {
    this.modoFormulario = modo;
    this.razaSelected = null;
    this.resetFormulario();
    this.openModal(modo);
  }

  resetFormulario(): void {
    this.form.reset({ nombre: '', especie: '' });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.respuestaError = '';
  }

  /** Abre el modal en modo edición con los datos de la raza seleccionada. */
  abrirEdicion(raza: Raza): void {
    this.razaSelected = raza;
    this.modoFormulario = 'E';
    this.respuestaError = '';
    this.form.reset({ nombre: raza.nombre ?? '', especie: raza.especie ?? '' });
    this.openModal(this.modoFormulario);
  }

  /** Crea o actualiza la raza según el modo del formulario. */
  guardarRaza(): void {
    if (this.form.invalid || this.enviando) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const raza: Raza = {
      razaId: this.razaSelected?.razaId,
      nombre: String(valores.nombre).trim(),
      especie: String(valores.especie).trim()
    };

    this.enviando = true;
    this.respuestaError = '';
    const solicitud = this.modoFormulario === 'C'
      ? this.razaService.crearRaza(raza)
      : this.razaService.actualizarRaza(raza);

    solicitud.subscribe({
      next: (respuesta) => {
        this.enviando = false;
        const mensaje = this.obtenerMensajeRespuesta(
          respuesta,
          this.modoFormulario === 'C' ? 'La raza fue creada correctamente.' : 'La raza fue actualizada correctamente.'
        );
        this.closeModal();
        this.listar();
        Swal.fire('Operación exitosa', mensaje, 'success');
      },
      error: (error) => {
        this.enviando = false;
        this.respuestaError = this.mensajeError(error, 'No fue posible guardar la raza.');
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
    this.titleModal = modo === 'C' ? 'Crear Raza' : 'Editar Raza';
    this.titleBoton = modo === 'C' ? 'Guardar Raza' : 'Actualizar Raza';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearRaza');
    if (modalElement) {
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }
}
