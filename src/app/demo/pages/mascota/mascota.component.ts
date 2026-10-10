import { Component, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';

import { MascotaRequest, MascotaServiceService } from './service/mascota-service.service';
import { Mascota } from 'src/app/models/mascota';
import { Cliente } from 'src/app/models/cliente';
import { Raza } from 'src/app/models/raza';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';

import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-mascota',
  imports: [CommonModule, ReactiveFormsModule],
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
  listRazas: Raza[] = [];
  listClientes: Cliente[] = [];
  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 10;
  columnaOrden = 'nombre';
  direccionOrden: 'asc' | 'desc' = 'asc';
  cargandoMascotas = false;
  modalAbierto = false;

  // Formulario para crear o editar mascota.
  form!: FormGroup;
  mascotaSelected: Mascota | null = null;
  cargandoCatalogos = false;
  guardando = false;
  mensajeError = '';
  mensajeErrorListado = '';
  mensajeErrorCatalogos = '';

  constructor(private readonly mascotaService: MascotaServiceService,
    private readonly formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.listar();
    this.cargarCatalogos();
  }

  // Metodo ue permite inicializar el formulario con sus controles y validaciones.
  inicializarFormulario() {
    this.form = this.formBuilder.group({
      nombreMascota: ['', [Validators.required, Validators.pattern(/\S/)]],
      razaId: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(0)]],
      clienteId: ['', Validators.required]
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

  get razasDisponibles(): Raza[] {
    return this.listRazas.filter((raza) => this.obtenerIdRaza(raza) !== undefined);
  }

  get clientesDisponibles(): Cliente[] {
    return this.listClientes.filter((cliente) => this.obtenerIdCliente(cliente) !== undefined);
  }

  ordenarPor(columna: string): void {
    if (this.columnaOrden === columna) {
      this.direccionOrden = this.direccionOrden === 'asc' ? 'desc' : 'asc';
    } else {
      this.columnaOrden = columna;
      this.direccionOrden = 'asc';
    }

    this.listMascotas = [...this.listMascotas].sort((a, b) => {
      const valorA = this.obtenerValorOrden(a, columna);
      const valorB = this.obtenerValorOrden(b, columna);
      const comparacion = valorA.localeCompare(valorB, undefined, {
        sensitivity: 'base',
        numeric: true
      });

      return this.direccionOrden === 'asc' ? comparacion : -comparacion;
    });
  }

  private obtenerValorOrden(mascota: Mascota, columna: string): string {
    switch (columna) {
      case 'nombre':
        return mascota.nombreMascota ?? '';
      case 'especie':
        return mascota.raza?.especie ?? '';
      case 'raza':
        return mascota.raza?.nombre ?? '';
      case 'edad':
        return String(mascota.edad ?? 0);
      case 'cliente':
        return `${mascota.cliente?.nombres ?? ''} ${mascota.cliente?.apellidos ?? ''}`.trim();
      case 'fechaRegistro':
        return mascota.fechaRegistro ? new Date(mascota.fechaRegistro).toISOString() : '';
      default:
        return '';
    }
  }

  /**
   * Metodo que permite listar las mascotas registradas en la base de datos y mostrarlas en la tabla.
   */
  listar() {
    this.cargandoMascotas = true;
    this.mensajeErrorListado = '';
    this.mascotaService.getMascotas()
      .subscribe({
        next: (data) => {
          this.listMascotas = data;
          this.paginaActual = 1;
          this.cargandoMascotas = false;
        },
        error: (error: unknown) => {
          this.cargandoMascotas = false;
          this.mensajeErrorListado = this.obtenerMensajeError(error, 'No fue posible cargar las mascotas.');
        }
      });
  }

  cargarCatalogos(): void {
    this.cargandoCatalogos = true;
    this.mensajeErrorCatalogos = '';
    forkJoin({
      razas: this.mascotaService.getRazas(),
      clientes: this.mascotaService.getClientes()
    }).subscribe({
      next: ({ razas, clientes }) => {
        this.listRazas = razas;
        this.listClientes = clientes;
        this.cargandoCatalogos = false;
      },
      error: (error: unknown) => {
        this.cargandoCatalogos = false;
        this.mensajeErrorCatalogos = this.obtenerMensajeError(error, 'No fue posible cargar las razas y los clientes.');
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

  // Metodo privado para normalizar el texto, eliminando acentos y convirtiendo a minúsculas.
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
    this.mensajeError = '';
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
    this.mensajeError = '';
    this.form.patchValue({
      nombreMascota: mascota.nombreMascota,
      razaId: mascota.razaId ?? this.obtenerIdRaza(mascota.raza),
      edad: mascota.edad,
      clienteId: mascota.clienteId ?? this.obtenerIdCliente(mascota.cliente)
    });
    this.openModal(this.modoFormulario);
  }

  guardar(): void {
    if (this.form.invalid || this.cargandoCatalogos || this.guardando) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.modoFormulario === 'E' && this.mascotaSelected?.mascotaId === undefined) {
      this.mensajeError = 'No se encontró el identificador de la mascota que se desea actualizar.';
      return;
    }

    const values = this.form.getRawValue();
    const request: MascotaRequest = {
      nombreMascota: String(values.nombreMascota).trim(),
      edad: Number(values.edad),
      razaId: Number(values.razaId),
      clienteId: Number(values.clienteId)
    };

    if (this.mascotaSelected?.mascotaId !== undefined) {
      request.mascotaId = this.mascotaSelected.mascotaId;
    }

    this.guardando = true;
    this.mensajeError = '';
    const request$ = this.modoFormulario === 'C'
      ? this.mascotaService.guardarMascota(request)
      : this.mascotaService.actualizarMascota(request);

    request$.subscribe({
      next: (response) => {
        this.guardando = false;
        this.closeModal();
        this.listar();
        void Swal.fire('¡Listo!', response.message ?? 'La mascota se guardó correctamente.', 'success');
      },
      error: (error: unknown) => {
        this.guardando = false;
        this.mensajeError = this.obtenerMensajeError(error, 'No fue posible guardar la mascota.');
      }
    });
  }

  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.resetFormulario();
    this.mascotaSelected = null;
  }

  private obtenerIdRaza(raza?: Raza): number | undefined {
    const id = raza?.razaId ?? raza?.id;
    if (id === undefined || id === null || id === '') {
      return undefined;
    }
    const numericId = Number(id);
    return Number.isFinite(numericId) ? numericId : undefined;
  }

  private obtenerIdCliente(cliente?: Cliente): number | undefined {
    const id = cliente?.clienteId ?? cliente?.id;
    if (id === undefined || id === null || id === '') {
      return undefined;
    }
    const numericId = Number(id);
    return Number.isFinite(numericId) ? numericId : undefined;
  }

  openModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear Mascota' : 'Editar Mascota';
    this.titleBoton = modo === 'C' ? 'Guardar Mascota' : 'Actualizar Mascota';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearMascota');
    if (modalElement) {
      // Verificar si ya existe una instancia del modal
      if (!this.modalInstance) {
        this.modalInstance = new Modal(modalElement);
        modalElement.addEventListener('hidden.bs.modal', () => {
          this.modalAbierto = false;
          this.resetFormulario();
          this.mascotaSelected = null;
        });
      }
      this.modalAbierto = true;
      this.modalInstance.show();
    }
  }

  private obtenerMensajeError(error: unknown, mensajePorDefecto: string): string {
    if (error && typeof error === 'object') {
      const respuesta = error as { error?: { message?: string; error?: string } };
      return respuesta.error?.message ?? respuesta.error?.error ?? mensajePorDefecto;
    }
    return mensajePorDefecto;
  }

}
