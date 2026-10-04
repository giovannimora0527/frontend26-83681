import { Component, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';

import { MascotaServiceService } from './service/mascota-service.service';
import { Mascota } from 'src/app/models/mascota';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-mascota',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './mascota.component.html',
  styleUrl: './mascota.component.scss'
})
export class MascotaComponent implements OnInit {
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

  // Formulario para crear o editar mascota.
  form!: FormGroup;
  mascotaSelected: Mascota | null = null;

  // Listados auxiliares para desplegar en selects del modal
  listClientes: any[] = [];
  listRazas: any[] = [];

  constructor(
    private readonly mascotaService: MascotaServiceService,
    private readonly formBuilder: FormBuilder
  ) {
    this.inicializarFormulario();
  }

  ngOnInit(): void {
    this.listar();
    this.cargarSelects();
  }

  // Carga clientes y razas necesarios para el formulario del modal
  cargarSelects() {
    // Si tu servicio cuenta con endpoints para obtener razas/clientes, invócalos aquí.
  }

  // Método que permite inicializar el formulario con sus controles y validaciones.
  inicializarFormulario() {
    this.form = this.formBuilder.group({
      nombreMascota: ['', Validators.required],
      raza: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(0)]],
      cliente: ['', Validators.required]
    });
  }

  // Obtiene los controles del formulario para facilitar el acceso a sus propiedades y métodos.
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
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
   * Método que permite listar las mascotas registradas en la base de datos y mostrarlas en la tabla.
   */
  listar() {
    this.mascotaService.getMascotas()
      .subscribe({
        next: (data) => {
          console.log(data);
          this.listMascotas = data;
          this.paginaActual = 1;
        },
        error: (error) => {
          console.error('Error al obtener las mascotas:', error);
        }
      });
  }

  // Método que actualiza el término de búsqueda y reinicia la página actual a 1.
  actualizarBusqueda(event: Event) {
    this.terminoBusqueda = (event.target as HTMLInputElement).value;
    this.paginaActual = 1;
  }

  // Cambia paginación.
  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  // Método privado para normalizar el texto, eliminando acentos y convirtiendo a minúsculas.
  private normalizarTexto(texto: string): string {
    return texto
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  // Evento para abrir el modal de crear o editar mascota, dependiendo del modo recibido.
  nuevaMascota(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear Mascota' : 'Editar Mascota';
    this.modoFormulario = modo;
    this.mascotaSelected = null;
    this.resetFormulario();
    this.openModal(modo);
  }

  resetFormulario() {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  abrirEdicion(mascota: Mascota) {
    this.mascotaSelected = mascota;
    this.modoFormulario = 'E';
    this.form.patchValue({
      nombreMascota: mascota.nombreMascota,
      raza: mascota.raza?.nombre ?? mascota.raza ?? '',
      edad: mascota.edad,
      cliente: mascota.cliente ? `${mascota.cliente.nombres} ${mascota.cliente.apellidos}` : ''
    });
    this.openModal(this.modoFormulario);
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
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }

  guardarMascota() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const datos = this.form.value;
    console.log('Datos de la mascota a guardar:', datos);
  }
}