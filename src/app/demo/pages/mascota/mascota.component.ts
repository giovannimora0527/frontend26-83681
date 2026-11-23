import { Component } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

<<<<<<< HEAD
import { MascotaService } from './service/mascota.service';
import { Mascota } from 'src/app/models/mascota';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import Swal from 'sweetalert2';
import { Raza } from 'src/app/models/raza';
import { RazaService } from './service/raza.service';
import { ClienteService } from '../cliente/service/cliente.service';
import { Cliente } from 'src/app/models/cliente';

type ColumnaOrden = 'nombre' | 'especie' | 'raza' | 'edad' | 'cliente' | 'fechaRegistro' | 'estado';
type ModalBootstrap = { show(): void; hide(): void };
type WindowBootstrap = Window & { bootstrap: { Modal: new (element: Element) => ModalBootstrap } };

@Component({
  selector: 'app-mascota',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbTooltipModule],
=======
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
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
  templateUrl: './mascota.component.html',
  styleUrl: './mascota.component.scss'
})
export class MascotaComponent {
  // Variables para el modal.
  modalInstance: ModalBootstrap | null = null;
  titleModal: string = "";
  modoFormulario: string = "";
  titleBoton: string = "";

  // Variables para la paginación, ordenamiento y búsqueda en la datatable.
  listMascotas: Mascota[] = [];
  terminoBusqueda = '';
  paginaActual = 1;
<<<<<<< HEAD
  readonly registrosPorPagina = 5;
  columnaOrden: ColumnaOrden = 'nombre';
  direccionOrden: 'asc' | 'desc' = 'asc';

  listRazas: Raza[] = [];
  listClientes: Cliente[] = [];
=======
  readonly registrosPorPagina = 10;

  // Catálogos para los combos del formulario.
  razas: Raza[] = [];
  clientes: Cliente[] = [];
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3

  // Formulario para crear o editar mascota.
  form!: FormGroup;
  mascotaSelected: Mascota | null = null;
<<<<<<< HEAD
  enviando = false;
  respuestaError = '';

  constructor(private readonly mascotaService: MascotaService,
    private readonly razaService: RazaService,
    private readonly clienteService: ClienteService,
    private readonly formBuilder: FormBuilder) {
=======
  guardando = false;
  avisoFormulario: string | null = null;
  mensajeLista: { tipo: 'success' | 'danger'; texto: string } | null = null;

  constructor(private readonly mascotaService: MascotaServiceService,
    private readonly formBuilder: FormBuilder,
    private readonly razaService: RazaService,
    private readonly clienteService: ClienteService) {
    this.inicializarFormulario();
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
    this.listar();
    this.listarRazas();
    this.inicializarFormulario();
    this.listarClientes();
  }

  listarClientes() {
    this.clienteService.listarClientes()
      .subscribe({
        next: (data) => {
          this.listClientes = data;
        },
        error: (error) => {
          console.error('Error al obtener los clientes:', error);
        }
      });
  }

  /**
   * Metodo que lista las razas para el combo.
   */
  listarRazas() {
    this.razaService.listarRazas()
      .subscribe({
        next: (data) => {
          this.listRazas = data;
        },
        error: (error) => {
          console.error('Error al obtener las razas:', error);
        }
      });
  }

  // Metodo ue permite inicializar el formulario con sus controles y validaciones.
  inicializarFormulario() {
    this.form = this.formBuilder.group({
<<<<<<< HEAD
      nombreMascota: ['', Validators.required],
      raza: [null, Validators.required],
      edad: ['', [Validators.required, Validators.min(1)]],
      cliente: ['', Validators.required]      
=======
      nombreMascota: ['', [Validators.required, Validators.maxLength(100)]],
      razaId: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(0), Validators.max(60)]],
      clienteId: ['', Validators.required]
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
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
    const filtradas = this.listMascotas.filter((mascota) => {
      if (!termino) {
        return true;
      }
      if (termino === 'activo' || termino === 'true') {
        return mascota.activo === true;
      }
      if (termino === 'inactivo' || termino === 'false') {
        return mascota.activo === false;
      }

      const valores = [
        this.obtenerEstado(mascota),
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

    return [...filtradas].sort((mascotaA, mascotaB) => {
      const valorA = this.obtenerValorOrden(mascotaA, this.columnaOrden);
      const valorB = this.obtenerValorOrden(mascotaB, this.columnaOrden);
      const comparacion = typeof valorA === 'number' && typeof valorB === 'number'
        ? valorA - valorB
        : String(valorA).localeCompare(String(valorB), 'es', { numeric: true, sensitivity: 'base' });

      return this.direccionOrden === 'asc' ? comparacion : -comparacion;
    });
  }

  private obtenerValorOrden(mascota: Mascota, columna: ColumnaOrden): string | number {
    switch (columna) {
      case 'nombre':
        return mascota.nombreMascota ?? '';
      case 'especie':
        return mascota.raza?.especie ?? '';
      case 'raza':
        return mascota.raza?.nombre ?? '';
      case 'edad':
        return mascota.edad ?? 0;
      case 'cliente':
        return `${mascota.cliente?.nombres ?? ''} ${mascota.cliente?.apellidos ?? ''}`;
      case 'fechaRegistro':
        return mascota.fechaRegistro ? new Date(mascota.fechaRegistro).getTime() : 0;
      case 'estado':
        return this.obtenerEstado(mascota);
    }
  }

  obtenerEstado(mascota: Mascota): string {
    return mascota.activo == null ? 'No informado' : mascota.activo ? 'Activo' : 'Inactivo';
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
<<<<<<< HEAD
    this.mascotaService.listarMascotas()
      .subscribe(
        {
          next: (data) => {
            console.log(data);
=======
    this.mascotaService.getMascotas()
      .subscribe(
        {
          next: (data) => {
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
            this.listMascotas = data;
            this.paginaActual = 1;
          },
          error: (error) => {
<<<<<<< HEAD
            console.error('Error al obtener las mascotas:', error);
=======
            this.mensajeLista = { tipo: 'danger', texto: mensajeDeError(error) };
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
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

  compararRazas(razaA: Raza | null, razaB: Raza | null): boolean {
    return razaA === razaB || (
      razaA?.nombre === razaB?.nombre && razaA?.especie === razaB?.especie
    );
  }

  compararClientes(clienteA: Cliente | null, clienteB: Cliente | null): boolean {
    return clienteA === clienteB || (
      clienteA?.tipoDocumento === clienteB?.tipoDocumento && clienteA?.numeroDocumento === clienteB?.numeroDocumento
    );
  }

  /**
   * Metodos para la gestion de mascotas (crear, editar, guardar).
   */

  // Evento para abrir el modal de crear o editar mascota, dependiendo del modo recibido.
  nuevaMascota(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear Mascota' : 'Editar Mascota';
    this.modoFormulario = modo;
    this.mascotaSelected = null;
<<<<<<< HEAD
=======
    this.mensajeLista = null;
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
    this.resetFormulario();
    this.openModal(modo);
  }

  resetFormulario() {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
<<<<<<< HEAD
    this.respuestaError = '';
=======
    this.avisoFormulario = null;
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
  }

  abrirEdicion(mascota: Mascota) {
    this.mascotaSelected = mascota;
<<<<<<< HEAD
    this.modoFormulario = 'E';
    this.form.patchValue({
      nombreMascota: mascota.nombreMascota,
      raza: mascota.raza ?? null,
      edad: mascota.edad,
      cliente: mascota.cliente ?? null
    });
    this.openModal(this.modoFormulario);
  }

  /**
   * 
   * @returns Acción realizada sobre la mascota (crear o actualizar).
   */
  guardarMascota() {
    if (this.form.invalid || this.enviando) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();    
    const mascota: Mascota = {
      mascotaId: this.mascotaSelected?.mascotaId,
      nombre: valores.nombreMascota,
      edad: Number(valores.edad),
      razaId: valores.raza.razaId,
      clienteId: valores.cliente.id 
    };

    this.enviando = true;
    this.respuestaError = ''; 
    const solicitud = this.modoFormulario === 'C'
      ? this.mascotaService.crearMascota(mascota)
      : this.mascotaService.actualizarMascota(mascota);

    solicitud.subscribe({
      next: (respuesta) => {
        this.enviando = false;
        const mensaje = this.obtenerMensajeRespuesta(
          respuesta,
          this.modoFormulario === 'C' ? 'La mascota fue creada correctamente.' : 'La mascota fue actualizada correctamente.'
        );
        this.closeModal();
        this.listar();
        Swal.fire('Operación exitosa', mensaje, 'success');
      },
      error: (error) => {
        this.enviando = false;
        console.error('Error al guardar la mascota:', error);
        Swal.fire('Error', error.message, 'error');
      }
=======
    this.mensajeLista = null;
    this.resetFormulario();
    // Los combos trabajan con texto; los ids se convierten a cadena.
    this.form.patchValue({
      nombreMascota: mascota.nombreMascota ?? '',
      razaId: String(mascota.raza?.razaId ?? ''),
      edad: mascota.edad ?? '',
      clienteId: String(mascota.cliente?.clienteId ?? mascota.cliente?.id ?? '')
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
    });
    this.openModal('E');
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
<<<<<<< HEAD
      this.modalInstance ??= new (window as unknown as WindowBootstrap).bootstrap.Modal(modalElement);
        this.modalInstance.show();
    }
  }

=======
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
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3

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
