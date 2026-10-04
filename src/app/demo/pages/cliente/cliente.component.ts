import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ClienteServiceService } from './service/cliente-service.service';
import { Cliente } from 'src/app/models/cliente';
// Importa los objetos necesarios de Bootstrap
declare var bootstrap: any;

@Component({
  selector: 'app-cliente',
  imports: [CommonModule, FormsModule, NgbPaginationModule],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.scss'
})
export class ClienteComponent {

  listClientes: Cliente[] = [];

  // Busqueda por numero de documento
  documentoBusqueda = '';
  mensajeBusqueda = '';

  // Paginador
  paginaActual = 1;
  registrosPorPagina = 5;
  opcionesRegistros = [5, 10, 15];

  // Formulario para crear / editar
  modalInstance: any;
  modoEdicion = false;
  clienteForm: Cliente = this.clienteVacio();
  tiposDocumento = ['CC', 'CE', 'TI', 'PA'];

  constructor(private readonly clienteService: ClienteServiceService) {
    this.listar();
  }

  listar() {
    this.clienteService.getClientes()
      .subscribe(
        {
          next: (data) => {
            console.log(data);
            this.listClientes = data;
            this.paginaActual = 1;
            this.mensajeBusqueda = '';
          },
          error: (error) => {
            console.error('Error al obtener los clientes:', error);
          }
        }
      );
  }

  buscar() {
    const documento = this.documentoBusqueda.trim();
    if (documento === '') {
      this.listar();
      return;
    }
    this.clienteService.getClientePorDocumento(documento)
      .subscribe(
        {
          next: (data) => {
            this.listClientes = [data];
            this.paginaActual = 1;
            this.mensajeBusqueda = '';
          },
          error: (error) => {
            console.error('Error al buscar el cliente:', error);
            this.listClientes = [];
            this.mensajeBusqueda = error.error?.message ?? 'No fue posible buscar el cliente';
          }
        }
      );
  }

  clienteVacio(): Cliente {
    return {
      tipoDocumento: 'CC',
      numeroDocumento: '',
      nombres: '',
      apellidos: '',
      fechaNacimiento: '',
      genero: 'M',
      telefono: '',
      direccion: '',
      activo: true
    };
  }

  abrirModalNuevo() {
    this.modoEdicion = false;
    this.clienteForm = this.clienteVacio();
    this.abrirModal();
  }

  abrirModalEditar(cliente: Cliente) {
    this.modoEdicion = true;
    // Se copia el cliente para no modificar la tabla hasta guardar
    this.clienteForm = { ...cliente, clienteId: cliente.id };
    this.abrirModal();
  }

  abrirModal() {
    const modalElement = document.getElementById('modalCliente');
    this.modalInstance = new bootstrap.Modal(modalElement);
    this.modalInstance.show();
  }

  cerrarModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  guardar() {
    // Si no se selecciona fecha se envia vacia (undefined) para que el backend la guarde como nula
    const cliente: Cliente = { ...this.clienteForm, fechaNacimiento: this.clienteForm.fechaNacimiento || undefined };
    const peticion = this.modoEdicion
      ? this.clienteService.actualizarCliente(cliente)
      : this.clienteService.guardarCliente(cliente);

    peticion.subscribe(
      {
        next: (respuesta) => {
          this.cerrarModal();
          Swal.fire('Éxito', respuesta.message, 'success');
          this.documentoBusqueda = '';
          this.listar();
        },
        error: (error) => {
          console.error('Error al guardar el cliente:', error);
          Swal.fire('Error', error.error?.message ?? 'No fue posible guardar el cliente', 'error');
        }
      }
    );
  }

  // Clientes que se muestran en la pagina actual
  get clientesPaginados(): Cliente[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.listClientes.slice(inicio, inicio + this.registrosPorPagina);
  }

  get primerRegistro(): number {
    return (this.paginaActual - 1) * this.registrosPorPagina + 1;
  }

  get ultimoRegistro(): number {
    return Math.min(this.paginaActual * this.registrosPorPagina, this.listClientes.length);
  }

  cambiarRegistrosPorPagina() {
    this.paginaActual = 1;
  }

}
