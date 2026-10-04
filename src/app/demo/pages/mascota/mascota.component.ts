import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MascotaServiceService } from './service/mascota-service.service';
import { Mascota } from 'src/app/models/mascota';
import { MascotaRq } from 'src/app/models/mascota-rq';
import { Raza } from 'src/app/models/raza';
import { Cliente } from 'src/app/models/cliente';
import { RazaServiceService } from '../raza/service/raza-service.service';
import { ClienteServiceService } from '../cliente/service/cliente-service.service';
import { FormsModule } from '@angular/forms';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
// Importa los objetos necesarios de Bootstrap
declare var bootstrap: any;

@Component({
  selector: 'app-mascota',
  imports: [CommonModule, FormsModule, NgbPaginationModule],
  templateUrl: './mascota.component.html',
  styleUrl: './mascota.component.scss'
})
export class MascotaComponent {

  listMascotas: Mascota[] = [];

  // Busqueda por nombre
  nombreBusqueda = '';
  mensajeBusqueda = '';

  // Paginador
  paginaActual = 1;
  registrosPorPagina = 5;
  opcionesRegistros = [5, 10, 15];

  // Formulario para crear / editar
  modalInstance: any;
  modoEdicion = false;
  mascotaForm: MascotaRq = new MascotaRq();
  listRazas: Raza[] = [];
  listClientes: Cliente[] = [];

  constructor(
    private readonly mascotaService: MascotaServiceService,
    private readonly razaService: RazaServiceService,
    private readonly clienteService: ClienteServiceService
  ) {
     this.listar();
     this.cargarRazas();
     this.cargarClientes();
  }

  listar() {
    this.mascotaService.getMascotas()
      .subscribe(
        {
          next: (data) => {
            console.log(data);
            this.listMascotas = data;
            this.paginaActual = 1;
            this.mensajeBusqueda = '';
          },
          error: (error) => {
            console.error('Error al obtener las mascotas:', error);
          }
        }
      );
  }

  cargarRazas() {
    this.razaService.getRazas()
      .subscribe(
        {
          next: (data) => {
            this.listRazas = data;
          },
          error: (error) => {
            console.error('Error al obtener las razas:', error);
          }
        }
      );
  }

  cargarClientes() {
    this.clienteService.getClientes()
      .subscribe(
        {
          next: (data) => {
            this.listClientes = data;
          },
          error: (error) => {
            console.error('Error al obtener los clientes:', error);
          }
        }
      );
  }

  buscar() {
    const nombre = this.nombreBusqueda.trim();
    if (nombre === '') {
      this.listar();
      return;
    }
    this.mascotaService.getMascotaPorNombre(nombre)
      .subscribe(
        {
          next: (data) => {
            this.listMascotas = [data];
            this.paginaActual = 1;
            this.mensajeBusqueda = '';
          },
          error: (error) => {
            console.error('Error al buscar la mascota:', error);
            this.listMascotas = [];
            this.mensajeBusqueda = error.error?.message ?? 'No fue posible buscar la mascota';
          }
        }
      );
  }

  abrirModalNuevo() {
    this.modoEdicion = false;
    this.mascotaForm = new MascotaRq();
    this.abrirModal();
  }

  abrirModalEditar(mascota: Mascota) {
    this.modoEdicion = true;
    this.mascotaForm = {
      mascotaId: mascota.mascotaId,
      nombreMascota: mascota.nombreMascota,
      edad: mascota.edad,
      razaId: mascota.raza?.razaId,
      clienteId: mascota.cliente?.id
    };
    this.abrirModal();
  }

  abrirModal() {
    const modalElement = document.getElementById('modalMascota');
    this.modalInstance = new bootstrap.Modal(modalElement);
    this.modalInstance.show();
  }

  cerrarModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  guardar() {
    const peticion = this.modoEdicion
      ? this.mascotaService.actualizarMascota(this.mascotaForm)
      : this.mascotaService.guardarMascota(this.mascotaForm);

    peticion.subscribe(
      {
        next: (respuesta) => {
          this.cerrarModal();
          Swal.fire('Éxito', respuesta.message, 'success');
          this.nombreBusqueda = '';
          this.listar();
        },
        error: (error) => {
          console.error('Error al guardar la mascota:', error);
          Swal.fire('Error', error.error?.message ?? 'No fue posible guardar la mascota', 'error');
        }
      }
    );
  }

  // Mascotas que se muestran en la pagina actual
  get mascotasPaginadas(): Mascota[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.listMascotas.slice(inicio, inicio + this.registrosPorPagina);
  }

  get primerRegistro(): number {
    return (this.paginaActual - 1) * this.registrosPorPagina + 1;
  }

  get ultimoRegistro(): number {
    return Math.min(this.paginaActual * this.registrosPorPagina, this.listMascotas.length);
  }

  cambiarRegistrosPorPagina() {
    this.paginaActual = 1;
  }

}
