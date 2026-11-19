import { Component } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { MascotaService } from './service/mascota.service';
import { Mascota } from 'src/app/models/mascota';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import Swal from 'sweetalert2';
import { Raza } from 'src/app/models/raza';
import { RazaService } from './service/raza.service';
import { ClienteService } from '../cliente/service/cliente.service';
import { Cliente } from 'src/app/models/cliente';

/** Enumera las columnas por las que se puede ordenar la tabla. */
type ColumnaOrden = 'nombre' | 'especie' | 'raza' | 'edad' | 'cliente' | 'fechaRegistro' | 'estado';
/** Define las acciones que usa la pantalla para abrir y cerrar una ventana. */
type ModalBootstrap = {
  /** Abre la ventana. */
  show(): void;
  /** Cierra la ventana. */
  hide(): void;
};
/** Describe dónde se encuentra Bootstrap en la ventana del navegador. */
type WindowBootstrap = Window & { bootstrap: { Modal: new (element: Element) => ModalBootstrap } };

/** Presenta la pantalla de mascotas y gestiona sus acciones. */
@Component({
  selector: 'app-mascota',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbTooltipModule],
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
  readonly registrosPorPagina = 5;
  columnaOrden: ColumnaOrden = 'nombre';
  direccionOrden: 'asc' | 'desc' = 'asc';

  listRazas: Raza[] = [];
  listClientes: Cliente[] = [];

  // Formulario para crear o editar mascota.
  form!: FormGroup;
  mascotaSelected: Mascota | null = null;
  enviando = false;
  respuestaError = '';

  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor(private readonly mascotaService: MascotaService,
    private readonly razaService: RazaService,
    private readonly clienteService: ClienteService,
    private readonly formBuilder: FormBuilder) {
    this.listar();
    this.listarRazas();
    this.inicializarFormulario();
    this.listarClientes();
  }

  /** Consulta los clientes. */
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
  /** Prepara los campos del formulario y sus validaciones. */
  inicializarFormulario() {
    this.form = this.formBuilder.group({
      nombreMascota: ['', Validators.required],
      raza: [null, Validators.required],
      edad: ['', [Validators.required, Validators.min(1)]],
      cliente: ['', Validators.required]      
    });
  }

  // Obtiene los controles del formulario para facilitar el acceso a sus propiedades y métodos.
  /** Da acceso a los controles del formulario para consultar su valor y sus errores. */
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
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

  /** Obtiene el valor de la columna que se usa para ordenar cada fila. */
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

  /** Devuelve el estado que se usa para presentar el registro. */
  obtenerEstado(mascota: Mascota): string {
    if (mascota.activo === true) return 'Activo';
    if (mascota.activo === false) return 'Inactivo';
    return 'No informado';
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

  /** Devuelve las mascotas de la página visible. */
  get mascotasPaginadas(): Mascota[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.mascotasFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  /** Calcula cuántas páginas se necesitan para mostrar el listado. */
  get totalPaginas(): number {
    return Math.ceil(this.mascotasFiltradas.length / this.registrosPorPagina);
  }

  /** Devuelve los números de página disponibles para el listado. */
  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, indice) => indice + 1);
  }

  /**
   * Metodo que permite listar las mascotas registradas en la base de datos y mostrarlas en la tabla.
   */
  listar() {
    this.mascotaService.listarMascotas()
      .subscribe(
        {
          next: (data) => {
            console.log(data);
            this.listMascotas = data;
            this.paginaActual = 1;
          },
          error: (error) => {
            console.error('Error al obtener las mascotas:', error);
          }
        }
      );
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

  /** Comprueba si dos opciones representan la misma raza. */
  compararRazas(razaA: Raza | null, razaB: Raza | null): boolean {
    return razaA === razaB || (
      razaA?.nombre === razaB?.nombre && razaA?.especie === razaB?.especie
    );
  }

  /** Comprueba si dos opciones representan al mismo propietario. */
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
  abrirEdicion(mascota: Mascota) {
    this.mascotaSelected = mascota;
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
    this.titleModal = modo === 'C' ? 'Crear Mascota' : 'Editar Mascota';
    this.titleBoton = modo === 'C' ? 'Guardar Mascota' : 'Actualizar Mascota';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearMascota');
    if (modalElement) {
      // Verificar si ya existe una instancia del modal
      this.modalInstance ??= new (window as unknown as WindowBootstrap).bootstrap.Modal(modalElement);
        this.modalInstance.show();
    }
  }


}
