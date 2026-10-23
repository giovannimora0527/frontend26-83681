import { Component } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';

import { MedicamentoService } from './service/medicamento.service';
import { Medicamento } from 'src/app/models/medicamento';
import { MedicamentoRq } from 'src/app/models/requests';

import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-medicamento',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './medicamento.component.html',
  styleUrl: './medicamento.component.scss'
})
export class MedicamentoComponent {
  // Variables para el modal.
  modalInstance: Modal | null = null;
  titleModal = '';
  modoFormulario = '';
  titleBoton = '';

  // Variables para la paginación y búsqueda en la datatable.
  listMedicamentos: Medicamento[] = [];
  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 10;

  // Formulario para crear o editar medicamento.
  form!: FormGroup;
  medicamentoSelected: Medicamento | null = null;

  constructor(private readonly medicamentoService: MedicamentoService,
    private readonly formBuilder: FormBuilder) {
    this.listar();
    this.inicializarFormulario();
  }

  // Metodo que permite inicializar el formulario con sus controles y validaciones.
  inicializarFormulario() {
    this.form = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      presentacion: ['', [Validators.required, Validators.maxLength(80)]],
      descripcion: ['']
    });
  }

  // Obtiene los controles del formulario para facilitar el acceso a sus propiedades y métodos.
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  // Filtra la lista de medicamentos según el término de búsqueda ingresado por el usuario.
  get medicamentosFiltrados(): Medicamento[] {
    const termino = this.normalizarTexto(this.terminoBusqueda);
    if (!termino) {
      return this.listMedicamentos;
    }

    return this.listMedicamentos.filter((medicamento) =>
      [
        medicamento.nombre,
        medicamento.presentacion,
        medicamento.descripcion,
        medicamento.fechaCreacion ? formatDate(medicamento.fechaCreacion, 'yyyy-MM-dd HH:mm', 'en-US') : ''
      ].some((valor) =>
        this.normalizarTexto(String(valor ?? '')).includes(termino)
      )
    );
  }

  get medicamentosPaginados(): Medicamento[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.medicamentosFiltrados.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.medicamentosFiltrados.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, indice) => indice + 1);
  }

  // Metodo que permite listar los medicamentos registrados en la base de datos.
  listar() {
    this.medicamentoService.getMedicamentos().subscribe({
      next: (data) => {
        this.listMedicamentos = data;
        this.paginaActual = 1;
      },
      error: (error) => {
        console.error('Error al obtener los medicamentos:', error);
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

  // Verifica si ya existe otro medicamento con el mismo nombre y presentación.
  private existeMedicamento(nombre: string, presentacion: string): boolean {
    return this.listMedicamentos.some((medicamento) =>
      medicamento.id !== this.medicamentoSelected?.id &&
      this.normalizarTexto(medicamento.nombre ?? '') === this.normalizarTexto(nombre) &&
      this.normalizarTexto(medicamento.presentacion ?? '') === this.normalizarTexto(presentacion)
    );
  }

  // Crea o actualiza el medicamento dependiendo del modo del formulario.
  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const nombre = this.form.value.nombre.trim();
    const presentacion = this.form.value.presentacion.trim();
    const descripcion = (this.form.value.descripcion ?? '').trim() || null;

    if (this.existeMedicamento(nombre, presentacion)) {
      Swal.fire('Registro duplicado', `Ya existe el medicamento "${nombre}" con presentación "${presentacion}".`, 'warning');
      return;
    }

    const medicamento: MedicamentoRq = { id: this.medicamentoSelected?.id, nombre, presentacion, descripcion };
    const peticion = this.modoFormulario === 'C'
      ? this.medicamentoService.crearMedicamento(medicamento)
      : this.medicamentoService.actualizarMedicamento(medicamento);

    peticion.subscribe({
      next: () => {
        Swal.fire('Éxito', this.modoFormulario === 'C' ? 'Medicamento creado correctamente.' : 'Medicamento actualizado correctamente.', 'success');
        this.closeModal();
        this.listar();
      },
      error: (error) => {
        console.error('Error al guardar el medicamento:', error);
        Swal.fire('Error', error?.error?.message ?? 'No fue posible guardar el medicamento.', 'error');
      }
    });
  }

  // Solicita confirmación y elimina el medicamento seleccionado.
  eliminar(medicamento: Medicamento) {
    Swal.fire({
      title: '¿Eliminar medicamento?',
      text: `Se eliminará el medicamento "${medicamento.nombre}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((resultado) => {
      if (!resultado.isConfirmed) {
        return;
      }
      this.medicamentoService.eliminarMedicamento(medicamento.id!).subscribe({
        next: () => {
          Swal.fire('Eliminado', 'El medicamento fue eliminado correctamente.', 'success');
          this.listar();
        },
        error: (error) => {
          console.error('Error al eliminar el medicamento:', error);
          Swal.fire('Error', error?.error?.message ?? 'No fue posible eliminar el medicamento.', 'error');
        }
      });
    });
  }

  // Evento para abrir el modal de crear medicamento.
  nuevoMedicamento() {
    this.medicamentoSelected = null;
    this.resetFormulario();
    this.openModal('C');
  }

  abrirEdicion(medicamento: Medicamento) {
    this.medicamentoSelected = medicamento;
    this.resetFormulario();
    this.form.patchValue({
      nombre: medicamento.nombre,
      presentacion: medicamento.presentacion,
      descripcion: medicamento.descripcion
    });
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
    this.titleModal = modo === 'C' ? 'Crear Medicamento' : 'Editar Medicamento';
    this.titleBoton = modo === 'C' ? 'Guardar Medicamento' : 'Actualizar Medicamento';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalMedicamento');
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
