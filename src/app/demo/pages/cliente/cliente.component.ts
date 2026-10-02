import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClienteService } from './service/cliente.service';
import { Cliente } from 'src/app/models/cliente';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.scss'
})
export class ClienteComponent {
  // Variables para el modal
  modalInstance: Modal | null = null;
  titleModal: string = "";
  modoFormulario: string = "";
  titleBoton: string = "";

  // Variables para paginación y búsqueda
  listClientes: Cliente[] = [];
  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 10;

  // Formulario
  form!: FormGroup;
  clienteSelected: Cliente | null = null;

  constructor(
    private readonly clienteService: ClienteService,
    private readonly formBuilder: FormBuilder
  ) {
    this.listar();
    this.inicializarFormulario();
  }

  inicializarFormulario() {
    this.form = this.formBuilder.group({
      tipo_documento: ['', Validators.required],
      numero_documento: ['', Validators.required],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required],
      genero: ['', Validators.required],
      telefono: ['', Validators.required],
      direccion: ['', Validators.required],
      activo: [true]
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get clientesFiltrados(): Cliente[] {
    const termino = this.normalizarTexto(this.terminoBusqueda.trim());
    if (!termino) {
      return this.listClientes;
    }

    return this.listClientes.filter((cliente) => {
      const valores = [
        cliente.tipoDocumento,
        cliente.numeroDocumento,
        cliente.nombres,
        cliente.apellidos,
        cliente.telefono,
        cliente.direccion,
        cliente.activo ? 'activo' : 'inactivo'
      ];

      return valores.some((valor) =>
        this.normalizarTexto(String(valor ?? '')).includes(termino)
      );
    });
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

  listar() {
    this.clienteService.getClientes().subscribe({
      next: (data) => {
        this.listClientes = data;
        this.paginaActual = 1;
      },
      error: (error) => {
        console.error('Error al obtener los clientes:', error);
      }
    });
  }

  actualizarBusqueda(event: Event) {
    this.terminoBusqueda = (event.target as HTMLInputElement).value;
    this.paginaActual = 1;
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  private normalizarTexto(texto: string): string {
    return texto
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  nuevoCliente(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear Cliente' : 'Editar Cliente';
    this.modoFormulario = modo;
    this.clienteSelected = null;
    this.resetFormulario();
    this.openModal(modo);
  }

  resetFormulario() {
    this.form.reset({ activo: true });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  abrirEdicion(cliente: Cliente) {
    this.clienteSelected = cliente;
    this.modoFormulario = 'E';
    this.form.patchValue({
      tipo_documento: cliente.tipoDocumento,
      numero_documento: cliente.numeroDocumento,
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
      fecha_nacimiento: cliente.fechaNacimiento,
      genero: cliente.genero,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
      activo: cliente.activo
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
    this.titleModal = modo === 'C' ? 'Crear Cliente' : 'Editar Cliente';
    this.titleBoton = modo === 'C' ? 'Guardar Cliente' : 'Actualizar Cliente';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearCliente');
    if (modalElement) {
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }
}