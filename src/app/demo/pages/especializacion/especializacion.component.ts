import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { Especializacion } from 'src/app/models/especializacion';

import Swal from 'sweetalert2';

import { EspecializacionService } from './service/especializacion.service';

/** Enumera las columnas por las que se puede ordenar la tabla. */
type ColumnaOrden = 'nombre' | 'descripcion' | 'codigoEspecializacion';
/** Define las acciones que usa la pantalla para abrir y cerrar una ventana. */
type ModalBootstrap = {
  /** Abre la ventana. */
  show(): void;
  /** Cierra la ventana. */
  hide(): void;
};
/** Describe dónde se encuentra Bootstrap en la ventana del navegador. */
type WindowBootstrap = Window & { bootstrap: { Modal: new (element: Element) => ModalBootstrap } };

/** Presenta la pantalla de especialidades veterinarias y gestiona sus acciones. */
@Component({
  selector: 'app-especializacion',
  imports: [CommonModule, ReactiveFormsModule, NgbTooltipModule],
  templateUrl: './especializacion.component.html',
  styleUrl: './especializacion.component.scss'
})
export class EspecializacionComponent {
  // Variables para el modal.
  modalInstance: ModalBootstrap | null = null;
  titleModal: string = "";
  modoFormulario: string = "";
  titleBoton: string = "";

  // Variables para la paginación, ordenamiento y búsqueda en la datatable.
  listEspecializaciones: Especializacion[] = [];
  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 5;
  columnaOrden: ColumnaOrden = 'nombre';
  direccionOrden: 'asc' | 'desc' = 'asc';


  // Formulario para crear o editar especializacion.
  form!: FormGroup;
  especializacionSelected: Especializacion | null = null;
  enviando = false;
  respuestaError = '';

  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor(private readonly especializacionService: EspecializacionService,
    private readonly formBuilder: FormBuilder
  ) {
    this.listar();
    this.inicializarFormulario();
  }

  // Metodo ue permite inicializar el formulario con sus controles y validaciones.
  /** Prepara los campos del formulario y sus validaciones. */
  inicializarFormulario() {
    this.form = this.formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: [null, Validators.required],
      codigoEspecializacion: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /** Solicita el listado que muestra este módulo. */
  listar() {
    this.especializacionService.listar().subscribe({
      next: (data) => {
        this.listEspecializaciones = Array.isArray(data) ? data : [];
        this.paginaActual = Math.min(this.paginaActual, this.totalPaginas || 1);
      },
      error: (err) => {
        console.error('Error al listar especializaciones', err);
      }
    });
  }

  // Obtiene los controles del formulario para facilitar el acceso a sus propiedades y métodos.
  /** Da acceso a los controles del formulario para consultar su valor y sus errores. */
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  /**
   * Filtra la lista de especializaciones según el término de búsqueda ingresado por el usuario.
   * @returns Un arreglo de especializaciones filtradas.
   */
  get especializacionesFiltradas(): Especializacion[] {
    const termino = this.normalizarTexto(this.terminoBusqueda.trim());
    const filtradas = this.listEspecializaciones.filter((especializacion) => {
      if (!termino) {
        return true;
      }

      const valores = [
        especializacion.nombre,
        especializacion.descripcion,
        especializacion.codigoEspecializacion
      ];

      return valores.some((valor) =>
        this.normalizarTexto(String(valor ?? '')).includes(termino)
      );
    });

    return [...filtradas].sort((especializacionA, especializacionB) => {
      const valorA = this.obtenerValorOrden(especializacionA, this.columnaOrden);
      const valorB = this.obtenerValorOrden(especializacionB, this.columnaOrden);
      const comparacion = typeof valorA === 'number' && typeof valorB === 'number'
        ? valorA - valorB
        : String(valorA).localeCompare(String(valorB), 'es', { numeric: true, sensitivity: 'base' });

      return this.direccionOrden === 'asc' ? comparacion : -comparacion;
    });
  }

  /** Obtiene el valor de la columna que se usa para ordenar cada fila. */
  private obtenerValorOrden(especializacion: Especializacion, columna: ColumnaOrden): string | number {
    switch (columna) {
      case 'nombre':
        return especializacion.nombre ?? '';
      case 'descripcion':
        return especializacion.descripcion ?? '';
      case 'codigoEspecializacion':
        return especializacion.codigoEspecializacion ?? '';
    }
  }

  /** Cambia la columna de orden o invierte el sentido del orden actual. */
  ordenarPor(columna: ColumnaOrden): void {
    if (this.columnaOrden === columna) {
      this.direccionOrden = this.direccionOrden === 'asc' ? 'desc' : 'asc';
    } else {
      this.columnaOrden = columna;
      this.direccionOrden = 'asc';
    }
    this.paginaActual = 1;
  }

  /** Devuelve las especialidades de la página visible. */
  get especializacionesPaginadas(): Especializacion[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.especializacionesFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  /** Calcula cuántas páginas se necesitan para mostrar el listado. */
  get totalPaginas(): number {
    return Math.ceil(this.especializacionesFiltradas.length / this.registrosPorPagina);
  }

  /** Devuelve los números de página disponibles para el listado. */
  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, indice) => indice + 1);
  }

  // Metodo que actualiza el termino de busqueda y reinicia la pagina actual a 1.
  /** Aplica el texto de búsqueda y vuelve a la primera página. */
  actualizarBusqueda(event: Event) {
    this.terminoBusqueda = (event.target as HTMLInputElement).value;
    this.paginaActual = 1;
  }

  // Cambia paginacion.
  /** Muestra la página seleccionada del listado. */
  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  // Metodo privado para normalizar el texto, eliminando acentos y convirtiendo a minúsculas.
  /** Prepara el texto para comparar búsquedas sin distinguir mayúsculas ni tildes. */
  private normalizarTexto(texto: string): string {
    return texto
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Metodos para la gestion de especializaciones (crear, editar, guardar).
   */

  // Evento para abrir el modal de crear o editar especializacion, dependiendo del modo recibido.
  nuevaEspecializacion(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear Especialización' : 'Editar Especialización';
    this.modoFormulario = modo;
    this.especializacionSelected = null;
    this.resetFormulario();
    this.openModal(modo);
  }

  /** Restablece los campos y la selección del formulario. */
  resetFormulario() {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.respuestaError = '';
  }

  /** Abre el formulario con los datos del registro que se quiere modificar. */
  abrirEdicion(especializacion: Especializacion) {
    this.especializacionSelected = especializacion;
    this.modoFormulario = 'E';
    this.form.patchValue({
      nombre: especializacion.nombre,
      descripcion: especializacion.descripcion ?? null,
      codigoEspecializacion: especializacion.codigoEspecializacion ?? null
    });
    this.openModal(this.modoFormulario);
  }

  /**
   * 
   * @returns Acción realizada sobre la mascota (crear o actualizar).
   */
  guardarEspecializacion() {
    if (this.form.invalid || this.enviando) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const especializacion: Especializacion = {
      id: this.especializacionSelected?.id,
      nombre: valores.nombre,
      descripcion: valores.descripcion,
      codigoEspecializacion: valores.codigoEspecializacion ?? null
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
        console.error('Error al guardar la especialización:', error);
        Swal.fire('Error', error.message, 'error');
      }
    });
  }

  /** Obtiene el mensaje que devuelve el servidor para mostrarlo en pantalla. */
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

  /** Cierra la ventana indicada. */
  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.resetFormulario();
  }

  /** Abre la ventana indicada. */
  openModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear Especialización' : 'Editar Especialización';
    this.titleBoton = modo === 'C' ? 'Guardar Especialización' : 'Actualizar Especialización';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearEspecializacion');
    if (modalElement) {
      // Verificar si ya existe una instancia del modal
      this.modalInstance ??= new (window as unknown as WindowBootstrap).bootstrap.Modal(modalElement);
      this.modalInstance.show();
    }
  }



}
