import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';

import { EspecializacionService } from './service/especializacion.service';
import { Especializacion } from 'src/app/models/especializacion';
import { EspecializacionRq } from 'src/app/models/requests';

import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-especializacion',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './especializacion.component.html',
  styleUrl: './especializacion.component.scss'
})
export class EspecializacionComponent {
  // Variables para el modal.
  modalInstance: Modal | null = null;
  titleModal = '';
  modoFormulario = '';
  titleBoton = '';

  // Variables para la paginación y búsqueda en la datatable.
  listEspecializaciones: Especializacion[] = [];
  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 10;

  // Formulario para crear o editar especialización.
  form!: FormGroup;
  especializacionSelected: Especializacion | null = null;

  constructor(private readonly especializacionService: EspecializacionService,
    private readonly formBuilder: FormBuilder) {
    this.listar();
    this.inicializarFormulario();
  }

  // Metodo que permite inicializar el formulario con sus controles y validaciones.
  inicializarFormulario() {
    this.form = this.formBuilder.group({
      codigoEspecializacion: ['', [Validators.required, Validators.maxLength(10)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['']
    });
  }

  // Obtiene los controles del formulario para facilitar el acceso a sus propiedades y métodos.
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  // Filtra la lista según el término de búsqueda ingresado por el usuario.
  get especializacionesFiltradas(): Especializacion[] {
    const termino = this.normalizarTexto(this.terminoBusqueda.trim());
    if (!termino) {
      return this.listEspecializaciones;
    }

    return this.listEspecializaciones.filter((especializacion) =>
      [especializacion.codigoEspecializacion, especializacion.nombre, especializacion.descripcion].some((valor) =>
        this.normalizarTexto(String(valor ?? '')).includes(termino)
      )
    );
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

  // Metodo que permite listar las especializaciones registradas en la base de datos.
  listar() {
    this.especializacionService.getEspecializaciones().subscribe({
      next: (data) => {
        this.listEspecializaciones = data;
        this.paginaActual = 1;
      },
      error: (error) => {
        console.error('Error al obtener las especializaciones:', error);
      }
    });
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

  // Busca otra especialización con el mismo código o nombre.
  private buscarDuplicado(codigo: string, nombre: string): string | null {
    const otras = this.listEspecializaciones.filter((e) => e.id !== this.especializacionSelected?.id);
    if (otras.some((e) => this.normalizarTexto(e.codigoEspecializacion ?? '') === this.normalizarTexto(codigo))) {
      return `Ya existe una especialización con el código ${codigo}.`;
    }
    if (otras.some((e) => this.normalizarTexto(e.nombre ?? '') === this.normalizarTexto(nombre))) {
      return `Ya existe una especialización con el nombre "${nombre}".`;
    }
    return null;
  }

  // Crea o actualiza la especialización dependiendo del modo del formulario.
  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.value;
    const codigoEspecializacion = valores.codigoEspecializacion.trim().toUpperCase();
    const nombre = valores.nombre.trim();

    const duplicado = this.buscarDuplicado(codigoEspecializacion, nombre);
    if (duplicado) {
      Swal.fire('Registro duplicado', duplicado, 'warning');
      return;
    }

    const especializacion: EspecializacionRq = {
      id: this.especializacionSelected?.id,
      codigoEspecializacion,
      nombre,
      descripcion: valores.descripcion?.trim() || null
    };
    const peticion = this.modoFormulario === 'C'
      ? this.especializacionService.crearEspecializacion(especializacion)
      : this.especializacionService.actualizarEspecializacion(especializacion);

    peticion.subscribe({
      next: () => {
        Swal.fire('Éxito', this.modoFormulario === 'C'
          ? 'Especialización creada correctamente.' : 'Especialización actualizada correctamente.', 'success');
        this.closeModal();
        this.listar();
      },
      error: (error) => {
        console.error('Error al guardar la especialización:', error);
        Swal.fire('Error', error?.error?.message ?? 'No fue posible guardar la especialización.', 'error');
      }
    });
  }

  // Solicita confirmación y elimina la especialización seleccionada.
  eliminar(especializacion: Especializacion) {
    Swal.fire({
      title: '¿Eliminar especialización?',
      text: `Se eliminará la especialización "${especializacion.nombre}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((resultado) => {
      if (!resultado.isConfirmed) {
        return;
      }
      this.especializacionService.eliminarEspecializacion(especializacion.id!).subscribe({
        next: () => {
          Swal.fire('Eliminada', 'La especialización fue eliminada correctamente.', 'success');
          this.listar();
        },
        error: (error) => {
          console.error('Error al eliminar la especialización:', error);
          Swal.fire('Error', error?.error?.message ?? 'No fue posible eliminar la especialización.', 'error');
        }
      });
    });
  }

  // Evento para abrir el modal de crear especialización.
  nuevaEspecializacion() {
    this.especializacionSelected = null;
    this.resetFormulario();
    this.openModal('C');
  }

  abrirEdicion(especializacion: Especializacion) {
    this.especializacionSelected = especializacion;
    this.resetFormulario();
    this.form.patchValue(especializacion);
    this.openModal('E');
  }

  resetFormulario() {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.resetFormulario();
  }

  openModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear Especialización' : 'Editar Especialización';
    this.titleBoton = modo === 'C' ? 'Guardar Especialización' : 'Actualizar Especialización';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalEspecializacion');
    if (modalElement) {
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
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
