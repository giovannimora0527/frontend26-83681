import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cliente, ClienteRq } from 'src/app/models/cliente';
import { ClienteService } from './service/cliente.service';
import { mensajeDeError } from 'src/app/services/api.util';

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

  /** Fecha máxima para la fecha de nacimiento (hoy, hora local). */
  readonly hoy = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  /** Cliente que se está editando; null cuando se crea uno nuevo. */
  private idEditando: number | null = null;
  private activoEditando = true;

  /** Mensaje de éxito o error de la lista (fuera del modal). */
  mensajeLista: { tipo: 'success' | 'danger'; texto: string } | null = null;

  /** Mensaje dentro del modal. */
  avisoFormulario: string | null = null;
  guardando = false;

  readonly clienteForm = new FormGroup({
    tipoDocumento: new FormControl('CC', { nonNullable: true, validators: [Validators.required] }),
    numeroDocumento: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(20), Validators.pattern(/^[0-9A-Za-z]+$/)]
    }),
    nombres: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    apellidos: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    fechaNacimiento: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    genero: new FormControl('', { nonNullable: true }),
    telefono: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(20)] }),
    direccion: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(200)] })
  });

  constructor(private readonly clienteService: ClienteService) {
    this.getClientes();
  }

  getClientes() {
    this.clienteService.getClientes()
      .subscribe(
        {
          next: (data) => {
            this.listClientes = data;
          },
          error: (error) => {
            this.mensajeLista = { tipo: 'danger', texto: mensajeDeError(error) };
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

  // Abre el modal en modo creación con el formulario vacío.
  nuevoCliente(modo: string) {
    this.idEditando = null;
    this.activoEditando = true;
    this.avisoFormulario = null;
    this.mensajeLista = null;
    this.clienteForm.reset({ tipoDocumento: 'CC' });
    this.openModal(modo);
  }

  // Abre el modal en modo edición, cargando los datos del cliente seleccionado.
  abrirEdicion(cliente: Cliente) {
    this.idEditando = cliente.clienteId ?? cliente.id ?? null;
    this.activoEditando = cliente.activo ?? true;
    this.avisoFormulario = null;
    this.mensajeLista = null;
    this.clienteForm.reset({
      tipoDocumento: cliente.tipoDocumento ?? 'CC',
      numeroDocumento: cliente.numeroDocumento ?? '',
      nombres: cliente.nombres ?? '',
      apellidos: cliente.apellidos ?? '',
      fechaNacimiento: cliente.fechaNacimiento ?? '',
      genero: cliente.genero ?? '',
      telefono: cliente.telefono ?? '',
      direccion: cliente.direccion ?? ''
    });
    this.openModal('E');
  }

  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
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

  /** Valida el formulario y crea o actualiza el cliente según el modo. */
  guardar() {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      this.avisoFormulario = 'Complete los campos obligatorios marcados en rojo. El número de documento solo admite letras y números.';
      return;
    }

    const v = this.clienteForm.getRawValue();
    const rq: ClienteRq = {
      tipoDocumento: v.tipoDocumento,
      numeroDocumento: v.numeroDocumento.trim(),
      nombres: v.nombres.trim(),
      apellidos: v.apellidos.trim(),
      fechaNacimiento: v.fechaNacimiento,
      genero: v.genero || null,
      telefono: v.telefono.trim() || null,
      direccion: v.direccion.trim() || null,
      activo: this.activoEditando
    };

    this.guardando = true;
    this.avisoFormulario = null;
    const esEdicion = this.idEditando !== null;
    const peticion = esEdicion
      ? this.clienteService.actualizar(this.idEditando as number, rq)
      : this.clienteService.crear(rq);

    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.closeModal();
        this.mensajeLista = {
          tipo: 'success',
          texto: esEdicion ? 'Cliente actualizado correctamente.' : 'Cliente creado correctamente.'
        };
        this.paginaActual = 1;
        this.getClientes();
      },
      error: (error) => {
        this.guardando = false;
        this.avisoFormulario = mensajeDeError(error);
      }
    });
  }
}
