import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';

import { ClienteService } from './service/cliente.service';
import { Cliente } from 'src/app/models/cliente';
import { ClienteRq } from 'src/app/models/requests';

import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-cliente',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.scss'
})
export class ClienteComponent {
  // Variables para el modal.
  modalInstance: Modal | null = null;
  titleModal = '';
  modoFormulario = '';
  titleBoton = '';

  // Variables para la paginación y búsqueda en la datatable.
  listClientes: Cliente[] = [];
  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 10;

  // Formulario para crear o editar cliente.
  form!: FormGroup;
  clienteSelected: Cliente | null = null;

  readonly tiposDocumento = ['CC', 'TI', 'CE', 'PA'];
  readonly generos = [
    { valor: 'M', texto: 'Masculino' },
    { valor: 'F', texto: 'Femenino' },
    { valor: 'O', texto: 'Otro' }
  ];

  constructor(private readonly clienteService: ClienteService,
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute) {
    this.leerFiltroDeUrl();
    this.listar();
    this.inicializarFormulario();
  }

  // Metodo que permite inicializar el formulario con sus controles y validaciones.
  inicializarFormulario() {
    this.form = this.formBuilder.group({
      tipoDocumento: ['', Validators.required],
      numeroDocumento: ['', [Validators.required, Validators.pattern(/^[0-9A-Za-z]+$/)]],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      fechaNacimiento: [''],
      genero: [''],
      telefono: ['', Validators.pattern(/^[0-9+\s-]{7,15}$/)],
      direccion: [''],
      activo: [true]
    });
  }

  // Obtiene los controles del formulario para facilitar el acceso a sus propiedades y métodos.
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  // Filtra la lista de clientes según el término de búsqueda ingresado por el usuario.
  get clientesFiltrados(): Cliente[] {
    const termino = this.normalizarTexto(this.terminoBusqueda.trim());
    if (!termino) {
      return this.listClientes;
    }

    return this.listClientes.filter((cliente) => {
      const valores = [
        cliente.tipoDocumento,
        cliente.numeroDocumento,
        `${cliente.nombres ?? ''} ${cliente.apellidos ?? ''}`,
        cliente.telefono,
        cliente.direccion
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

  // Metodo que permite listar los clientes registrados en la base de datos.
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

  // Si se llega desde la lupa del menu superior (?buscar=...), la tabla se abre ya filtrada.
  private leerFiltroDeUrl() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const buscar = params.get('buscar');
      if (buscar !== null) {
        this.terminoBusqueda = buscar;
        this.paginaActual = 1;
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

  // Verifica si ya existe otro cliente con el mismo tipo y número de documento.
  private existeCliente(tipoDocumento: string, numeroDocumento: string): boolean {
    return this.listClientes.some((cliente) =>
      cliente.id !== this.clienteSelected?.id &&
      cliente.tipoDocumento === tipoDocumento &&
      this.normalizarTexto(cliente.numeroDocumento ?? '') === this.normalizarTexto(numeroDocumento)
    );
  }

  // Crea o actualiza el cliente dependiendo del modo del formulario.
  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.value;
    const numeroDocumento = valores.numeroDocumento.trim();

    if (this.existeCliente(valores.tipoDocumento, numeroDocumento)) {
      Swal.fire('Registro duplicado', `Ya existe un cliente con el documento ${valores.tipoDocumento} ${numeroDocumento}.`, 'warning');
      return;
    }

    const cliente: ClienteRq = {
      id: this.clienteSelected?.id,
      tipoDocumento: valores.tipoDocumento,
      numeroDocumento,
      nombres: valores.nombres.trim(),
      apellidos: valores.apellidos.trim(),
      fechaNacimiento: valores.fechaNacimiento || null,
      genero: valores.genero || null,
      telefono: valores.telefono?.trim() || null,
      direccion: valores.direccion?.trim() || null,
      activo: !!valores.activo
    };
    const peticion = this.modoFormulario === 'C'
      ? this.clienteService.crearCliente(cliente)
      : this.clienteService.actualizarCliente(cliente);

    peticion.subscribe({
      next: () => {
        Swal.fire('Éxito', this.modoFormulario === 'C' ? 'Cliente creado correctamente.' : 'Cliente actualizado correctamente.', 'success');
        this.closeModal();
        this.listar();
      },
      error: (error) => {
        console.error('Error al guardar el cliente:', error);
        Swal.fire('Error', error?.error?.message ?? 'No fue posible guardar el cliente.', 'error');
      }
    });
  }

  // Solicita confirmación y elimina el cliente seleccionado.
  eliminar(cliente: Cliente) {
    Swal.fire({
      title: '¿Eliminar cliente?',
      text: `Se eliminará el cliente "${cliente.nombres} ${cliente.apellidos}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((resultado) => {
      if (!resultado.isConfirmed) {
        return;
      }
      this.clienteService.eliminarCliente(cliente.id!).subscribe({
        next: () => {
          Swal.fire('Eliminado', 'El cliente fue eliminado correctamente.', 'success');
          this.listar();
        },
        error: (error) => {
          console.error('Error al eliminar el cliente:', error);
          Swal.fire('Error', error?.error?.message ?? 'No fue posible eliminar el cliente.', 'error');
        }
      });
    });
  }

  // Evento para abrir el modal de crear cliente.
  nuevoCliente() {
    this.clienteSelected = null;
    this.resetFormulario();
    this.openModal('C');
  }

  abrirEdicion(cliente: Cliente) {
    this.clienteSelected = cliente;
    this.resetFormulario();
    this.form.patchValue({
      ...cliente,
      fechaNacimiento: cliente.fechaNacimiento ? cliente.fechaNacimiento.substring(0, 10) : ''
    });
    this.openModal('E');
  }

  resetFormulario() {
    this.form.reset({ activo: true });
    this.form.markAsPristine();
    this.form.markAsUntouched();
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
    const modalElement = document.getElementById('modalCliente');
    if (modalElement) {
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }

  // Metodo privado para normalizar el texto, eliminando acentos y convirtiendo a minúsculas.
  private normalizarTexto(texto: string): string {
    return texto
      .trim()
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }
}
