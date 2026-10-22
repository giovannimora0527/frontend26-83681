import { Component } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';

import { MascotaRq, MascotaServiceService } from './service/mascota-service.service';
import { Mascota } from 'src/app/models/mascota';
import { Cliente } from 'src/app/models/cliente';
import { Raza } from 'src/app/models/raza';
import { ClienteService } from 'src/app/demo/pages/cliente/service/cliente.service';
import { RazaService } from 'src/app/demo/pages/raza/service/raza.service';
import { mensajeDeError } from 'src/app/services/api.util';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { Modal } from 'bootstrap';

@Component({
  selector: 'app-mascota',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './mascota.component.html',
  styleUrl: './mascota.component.scss'
})
export class MascotaComponent {
  // Variables para el modal.
  modalInstance: Modal | null = null;
  titleModal: string = "";
  modoFormulario: string = "";
  titleBoton: string = "";

  // Variables para la paginación y búsqueda en la datatable.
  listMascotas: Mascota[] = [];
  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 10;

  // Catálogos para los combos del formulario.
  razas: Raza[] = [];
  clientes: Cliente[] = [];

  // Formulario para crear o editar mascota.
  form!: FormGroup;
  mascotaSelected: Mascota | null = null;
  guardando = false;
  avisoFormulario: string | null = null;
  mensajeLista: { tipo: 'success' | 'danger'; texto: string } | null = null;

  constructor(private readonly mascotaService: MascotaServiceService,
    private readonly formBuilder: FormBuilder,
    private readonly razaService: RazaService,
    private readonly clienteService: ClienteService) {
    this.inicializarFormulario();
    this.listar();
    this.cargarCatalogos();
  }

  // Metodo ue permite inicializar el formulario con sus controles y validaciones.
  inicializarFormulario() {
    this.form = this.formBuilder.group({
      nombreMascota: ['', [Validators.required, Validators.maxLength(100)]],
      razaId: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(0), Validators.max(60)]],
      clienteId: ['', Validators.required]
    });
  }

  // Obtiene los controles del formulario para facilitar el acceso a sus propiedades y métodos.
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  /** Carga razas y clientes para los combos. */
  cargarCatalogos() {
    this.razaService.getRazas().subscribe({
      next: (data) => (this.razas = data),
      error: (error) => (this.mensajeLista = { tipo: 'danger', texto: mensajeDeError(error) })
    });
    this.clienteService.getClientes().subscribe({
      next: (data) => (this.clientes = data),
      error: (error) => (this.mensajeLista = { tipo: 'danger', texto: mensajeDeError(error) })
    });
  }

  /**
   * Filtra la lista de mascotas según el término de búsqueda ingresado por el usuario.
   * @returns Un arreglo de mascotas filtradas.
   */
  get mascotasFiltradas(): Mascota[] {
    const termino = this.normalizarTexto(this.terminoBusqueda.trim());
    if (!termino) {
      return this.listMascotas;
    }

    return this.listMascotas.filter((mascota) => {
      const valores = [
        mascota.nombreMascota,
        mascota.raza?.especie,
        mascota.raza?.nombre,
        mascota.edad,
        `${mascota.cliente?.nombres ?? ''} ${mascota.cliente?.apellidos ?? ''}`,
        mascota.fechaRegistro
          ? formatDate(mascota.fechaRegistro, 'yyyy-MM-dd HH:mm', 'en-US')
          : ''
      ];

      return valores.some((valor) =>
        this.normalizarTexto(String(valor ?? '')).includes(termino)
      );
    });
  }

  get mascotasPaginadas(): Mascota[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.mascotasFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.mascotasFiltradas.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, indice) => indice + 1);
  }

  /**
   * Metodo que permite listar las mascotas registradas en la base de datos y mostrarlas en la tabla.
   */
  listar() {
    this.mascotaService.getMascotas()
      .subscribe(
        {
          next: (data) => {
            this.listMascotas = data;
            this.paginaActual = 1;
          },
          error: (error) => {
            this.mensajeLista = { tipo: 'danger', texto: mensajeDeError(error) };
          }
        }
      );
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
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }

  // Evento para abrir el modal de crear o editar mascota, dependiendo del modo recibido.
  nuevaMascota(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear Mascota' : 'Editar Mascota';
    this.modoFormulario = modo;
    this.mascotaSelected = null;
    this.mensajeLista = null;
    this.resetFormulario();
    this.openModal(modo);
  }

  resetFormulario() {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.avisoFormulario = null;
  }

  abrirEdicion(mascota: Mascota) {
    this.mascotaSelected = mascota;
    this.mensajeLista = null;
    this.resetFormulario();
    // Los combos trabajan con texto; los ids se convierten a cadena.
    this.form.patchValue({
      nombreMascota: mascota.nombreMascota ?? '',
      razaId: String(mascota.raza?.razaId ?? ''),
      edad: mascota.edad ?? '',
      clienteId: String(mascota.cliente?.clienteId ?? mascota.cliente?.id ?? '')
    });
    this.openModal('E');
  }

  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.resetFormulario();
  }

  openModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear Mascota' : 'Editar Mascota';
    this.titleBoton = modo === 'C' ? 'Guardar Mascota' : 'Actualizar Mascota';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearMascota');
    if (modalElement) {
      // Verificar si ya existe una instancia del modal
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }

  /** Valida el formulario y guarda la mascota (crear o actualizar según el modo). */
  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.avisoFormulario = 'Complete los campos obligatorios marcados en rojo. La edad debe estar entre 0 y 60 años.';
      return;
    }

    const v = this.form.getRawValue();
    const rq: MascotaRq = {
      mascotaId: this.mascotaSelected?.mascotaId,
      nombre: String(v.nombreMascota).trim(),
      edad: Number(v.edad),
      razaId: Number(v.razaId),
      clienteId: Number(v.clienteId)
    };

    const esEdicion = this.mascotaSelected !== null;
    this.guardando = true;
    this.avisoFormulario = null;
    const peticion = esEdicion
      ? this.mascotaService.actualizar(rq)
      : this.mascotaService.crear(rq);

    peticion.subscribe({
      next: (respuesta) => {
        this.guardando = false;
        this.closeModal();
        this.mensajeLista = { tipo: 'success', texto: respuesta.message };
        this.listar();
      },
      error: (error) => {
        this.guardando = false;
        this.avisoFormulario = mensajeDeError(error);
      }
    });
  }
}
