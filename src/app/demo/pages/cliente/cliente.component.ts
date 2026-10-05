import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cliente } from 'src/app/models/cliente';
import { ClienteService } from './service/cliente.service';

import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-cliente',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.scss'
})
export class ClienteComponent {
  listClientes: Cliente[] = [];
  // Variables para el modal.
  modalInstance: Modal | null = null;
  titleModal: string = "";
  modoFormulario: string = "";
  titleBoton: string = "";

  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 4;

  // Opciones de los selects del formulario.
  readonly tiposDocumento = [
    { valor: 'CC', texto: 'Cédula de ciudadanía' },
    { valor: 'CE', texto: 'Cédula de extranjería' },
    { valor: 'TI', texto: 'Tarjeta de identidad' },
    { valor: 'PA', texto: 'Pasaporte' }
  ];
  readonly generos = ['Masculino', 'Femenino', 'Otro'];

  // Formulario para crear o editar cliente.
  form!: FormGroup;
  clienteSelected: Cliente | null = null;
  guardando = false;

  constructor(private readonly clienteService: ClienteService,
    private readonly formBuilder: FormBuilder) {
    this.getClientes();
    this.inicializarFormulario();
  }

  // Metodo que permite inicializar el formulario con sus controles y validaciones.
  inicializarFormulario() {
    this.form = this.formBuilder.group({
      tipoDocumento: ['CC', Validators.required],
      numeroDocumento: ['', [Validators.required, Validators.pattern(/^[0-9A-Za-z]{5,15}$/)]],
      nombres: ['', [Validators.required, Validators.maxLength(60)]],
      apellidos: ['', [Validators.required, Validators.maxLength(60)]],
      fechaNacimiento: [''],
      genero: [''],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9+\s-]{7,15}$/)]],
      direccion: ['', Validators.maxLength(120)],
      activo: [true]
    });
  }

  // Obtiene los controles del formulario para facilitar el acceso a sus propiedades y métodos.
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  getClientes() {
    this.clienteService.getClientes()
      .subscribe(
        {
          next: (data) => {
            console.log(data);
            this.listClientes = data;
          },
          error: (error) => {
            console.error(error);
          }
        }
      );
  }

  /**
     * Filtra la lista de clientes según el término de búsqueda ingresado por el usuario.
     * @returns Un arreglo de clientes filtrados.
     */
  get clientesFiltrados(): Cliente[] {
    const termino = this.normalizarTexto(this.terminoBusqueda.trim());
    if (!termino) {
      return this.listClientes;
    }

    return this.listClientes.filter((cliente) => {
      const valores = [
        cliente.nombres,
        cliente.apellidos,
        cliente.numeroDocumento,
        cliente.telefono,
        cliente.direccion
      ];

      return valores.some((valor) =>
        this.normalizarTexto(String(valor ?? '')).includes(termino)
      );
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
      .replace(/[̀-ͯ]/g, '');
  }


  get clientesPaginados(): Cliente[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.clientesFiltrados.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.clientesFiltrados.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, indice) => indice + 1);
  }

  resetFormulario() {
    this.form.reset({ tipoDocumento: 'CC', activo: true });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  // Evento para abrir el modal de crear o editar cliente, dependiendo del modo recibido.
  nuevoCliente(modo: string) {
    this.clienteSelected = null;
    this.resetFormulario();
    this.openModal(modo);
  }

  abrirEdicion(cliente: Cliente) {
    this.clienteSelected = cliente;
    this.resetFormulario();
    this.form.patchValue({
      ...cliente,
      // El input type="date" necesita el formato yyyy-MM-dd.
      fechaNacimiento: cliente.fechaNacimiento ? cliente.fechaNacimiento.substring(0, 10) : ''
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
    this.titleModal = modo === 'C' ? 'Crear Cliente' : 'Editar Cliente';
    this.titleBoton = modo === 'C' ? 'Guardar Cliente' : 'Actualizar Cliente';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearCliente');
    if (modalElement) {
      // Verificar si ya existe una instancia del modal
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }

  // Guarda o actualiza el cliente segun el modo del formulario.
  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.value;
    const cliente: Cliente = {
      ...this.clienteSelected,
      ...valores,
      numeroDocumento: valores.numeroDocumento.trim(),
      nombres: valores.nombres.trim(),
      apellidos: valores.apellidos.trim(),
      fechaNacimiento: valores.fechaNacimiento || undefined,
      genero: valores.genero || undefined,
      activo: !!valores.activo
    };

    const peticion = this.modoFormulario === 'C'
      ? this.clienteService.guardarCliente(cliente)
      : this.clienteService.actualizarCliente(cliente);

    this.guardando = true;
    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.closeModal();
        this.getClientes();
        Swal.fire({
          icon: 'success',
          title: this.modoFormulario === 'C' ? 'Cliente registrado' : 'Cliente actualizado',
          timer: 1800,
          showConfirmButton: false
        });
      },
      error: (error) => {
        this.guardando = false;
        console.error('Error al guardar el cliente:', error);
        Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: 'Intenta de nuevo más tarde.' });
      }
    });
  }

}
