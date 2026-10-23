import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';

import { RazaService } from './service/raza.service';
import { Raza } from 'src/app/models/raza';
import { RazaRq } from 'src/app/models/requests';

import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-raza',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './raza.component.html',
  styleUrl: './raza.component.scss'
})
export class RazaComponent {
  // Variables para el modal.
  modalInstance: Modal | null = null;
  titleModal = '';
  modoFormulario = '';
  titleBoton = '';

  // Variables para la paginación y búsqueda en la datatable.
  listRazas: Raza[] = [];
  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 10;

  // Formulario para crear o editar raza.
  form!: FormGroup;
  razaSelected: Raza | null = null;

  constructor(private readonly razaService: RazaService,
    private readonly formBuilder: FormBuilder) {
    this.listar();
    this.inicializarFormulario();
  }

  // Metodo que permite inicializar el formulario con sus controles y validaciones.
  inicializarFormulario() {
    this.form = this.formBuilder.group({
      nombre: ['', Validators.required],
      especie: ['', Validators.required]
    });
  }

  // Obtiene los controles del formulario para facilitar el acceso a sus propiedades y métodos.
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  // Filtra la lista de razas según el término de búsqueda ingresado por el usuario.
  get razasFiltradas(): Raza[] {
    const termino = this.normalizarTexto(this.terminoBusqueda.trim());
    if (!termino) {
      return this.listRazas;
    }

    return this.listRazas.filter((raza) =>
      [raza.nombre, raza.especie].some((valor) =>
        this.normalizarTexto(String(valor ?? '')).includes(termino)
      )
    );
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

  // Metodo que permite listar las razas registradas en la base de datos.
  listar() {
    this.razaService.getRazas().subscribe({
      next: (data) => {
        this.listRazas = data;
        this.paginaActual = 1;
      },
      error: (error) => {
        console.error('Error al obtener las razas:', error);
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

  // Verifica si ya existe otra raza con el mismo nombre y especie.
  private existeRaza(nombre: string, especie: string): boolean {
    return this.listRazas.some((raza) =>
      raza.razaId !== this.razaSelected?.razaId &&
      this.normalizarTexto(raza.nombre ?? '') === this.normalizarTexto(nombre) &&
      this.normalizarTexto(raza.especie ?? '') === this.normalizarTexto(especie)
    );
  }

  // Crea o actualiza la raza dependiendo del modo del formulario.
  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const nombre = this.form.value.nombre.trim();
    const especie = this.form.value.especie.trim();

    if (this.existeRaza(nombre, especie)) {
      Swal.fire('Registro duplicado', `Ya existe la raza "${nombre}" para la especie "${especie}".`, 'warning');
      return;
    }

    const raza: RazaRq = { razaId: this.razaSelected?.razaId, nombre, especie };
    const peticion = this.modoFormulario === 'C'
      ? this.razaService.crearRaza(raza)
      : this.razaService.actualizarRaza(raza);

    peticion.subscribe({
      next: () => {
        Swal.fire('Éxito', this.modoFormulario === 'C' ? 'Raza creada correctamente.' : 'Raza actualizada correctamente.', 'success');
        this.closeModal();
        this.listar();
      },
      error: (error) => {
        console.error('Error al guardar la raza:', error);
        Swal.fire('Error', error?.error?.message ?? 'No fue posible guardar la raza.', 'error');
      }
    });
  }

  // Solicita confirmación y elimina la raza seleccionada.
  eliminar(raza: Raza) {
    Swal.fire({
      title: '¿Eliminar raza?',
      text: `Se eliminará la raza "${raza.nombre}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((resultado) => {
      if (!resultado.isConfirmed) {
        return;
      }
      this.razaService.eliminarRaza(raza.razaId!).subscribe({
        next: () => {
          Swal.fire('Eliminada', 'La raza fue eliminada correctamente.', 'success');
          this.listar();
        },
        error: (error) => {
          console.error('Error al eliminar la raza:', error);
          Swal.fire('Error', error?.error?.message ?? 'No fue posible eliminar la raza.', 'error');
        }
      });
    });
  }

  // Evento para abrir el modal de crear raza.
  nuevaRaza() {
    this.razaSelected = null;
    this.resetFormulario();
    this.openModal('C');
  }

  abrirEdicion(raza: Raza) {
    this.razaSelected = raza;
    this.resetFormulario();
    this.form.patchValue({
      nombre: raza.nombre,
      especie: raza.especie
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
    this.titleModal = modo === 'C' ? 'Crear Raza' : 'Editar Raza';
    this.titleBoton = modo === 'C' ? 'Guardar Raza' : 'Actualizar Raza';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalRaza');
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
