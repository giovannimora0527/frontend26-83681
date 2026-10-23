import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, formatDate } from '@angular/common';

import { MascotaServiceService } from './service/mascota-service.service';
import { RazaService } from '../raza/service/raza.service';
import { ClienteService } from '../cliente/service/cliente.service';
import { Mascota } from 'src/app/models/mascota';
import { Raza } from 'src/app/models/raza';
import { Cliente } from 'src/app/models/cliente';
import { MascotaRq } from 'src/app/models/requests';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-mascota',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './mascota.component.html',
  styleUrl: './mascota.component.scss'
})
export class MascotaComponent {
  // Variables para el modal.
  modalInstance: Modal | null = null;
  titleModal: string = "";
  modoFormulario: string = "";
  titleBoton: string = ""

  // Variables para la paginación y búsqueda en la datatable.
  listMascotas: Mascota[] = [];
  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 10;

  // Listas para los selects del formulario.
  listRazas: Raza[] = [];
  listClientes: Cliente[] = [];

  // Formulario para crear o editar mascota.
  form!: FormGroup;
  mascotaSelected: Mascota | null = null;

  constructor(private readonly mascotaService: MascotaServiceService,
    private readonly razaService: RazaService,
    private readonly clienteService: ClienteService,
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute) {
    this.leerFiltroDeUrl();
    this.listar();
    this.cargarListas();
    this.inicializarFormulario();
  }

  // Metodo ue permite inicializar el formulario con sus controles y validaciones.
  inicializarFormulario() {
    this.form = this.formBuilder.group({
      nombreMascota: ['', Validators.required],
      raza: [null, Validators.required],
      edad: [null, [Validators.required, Validators.min(0), Validators.max(50)]],
      cliente: [null, Validators.required]
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
        mascota.cliente?.numeroDocumento,
        // Mismo formato que se muestra en la tabla, para que buscar "2026-10-04" funcione.
        mascota.fechaRegistro ? formatDate(mascota.fechaRegistro, 'yyyy-MM-dd HH:mm', 'en-US') : ''
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
   * Metodo que permite listar las mascotas registradas en la base de datos y mostrarlas en la tabla.
   */
  listar() {
    this.mascotaService.getMascotas()
      .subscribe(
        {
          next: (data) => {
            this.listMascotas = data;
            this.paginaActual = 1;
          },
          error: (error) => {
            console.error('Error al obtener las mascotas:', error);
          }
        }
      );
  }

  // Carga las razas y clientes para los selects del formulario.
  cargarListas() {
    this.razaService.getRazas().subscribe({
      next: (data) => this.listRazas = data,
      error: (error) => console.error('Error al obtener las razas:', error)
    });
    this.clienteService.getClientes().subscribe({
      next: (data) => this.listClientes = data,
      error: (error) => console.error('Error al obtener los clientes:', error)
    });
  }

  // Funciones de comparacion para que los selects marquen el objeto correcto al editar.
  compararRaza = (a: Raza | null, b: Raza | null) => a?.razaId === b?.razaId;
  compararCliente = (a: Cliente | null, b: Cliente | null) => a?.id === b?.id;

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

  // Metodo privado para normalizar el texto, eliminando acentos y convirtiendo a minúsculas.
  private normalizarTexto(texto: string): string {
    return texto
      .trim()
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }

  // Verifica si el cliente ya tiene otra mascota registrada con el mismo nombre.
  private existeMascota(nombreMascota: string, cliente: Cliente): boolean {
    return this.listMascotas.some((mascota) =>
      mascota.mascotaId !== this.mascotaSelected?.mascotaId &&
      mascota.cliente?.id === cliente.id &&
      this.normalizarTexto(mascota.nombreMascota ?? '') === this.normalizarTexto(nombreMascota)
    );
  }

  // Crea o actualiza la mascota dependiendo del modo del formulario.
  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.value;
    const nombreMascota = valores.nombreMascota.trim();

    if (this.existeMascota(nombreMascota, valores.cliente)) {
      Swal.fire('Registro duplicado',
        `El cliente ${valores.cliente.nombres} ${valores.cliente.apellidos} ya tiene una mascota llamada "${nombreMascota}".`,
        'warning');
      return;
    }

    const mascota: MascotaRq = {
      mascotaId: this.mascotaSelected?.mascotaId,
      nombreMascota,
      edad: valores.edad,
      razaId: valores.raza.razaId,
      clienteId: valores.cliente.id
    };
    const peticion = this.modoFormulario === 'C'
      ? this.mascotaService.crearMascota(mascota)
      : this.mascotaService.actualizarMascota(mascota);

    peticion.subscribe({
      next: () => {
        Swal.fire('Éxito', this.modoFormulario === 'C' ? 'Mascota creada correctamente.' : 'Mascota actualizada correctamente.', 'success');
        this.closeModal();
        this.listar();
      },
      error: (error) => {
        console.error('Error al guardar la mascota:', error);
        Swal.fire('Error', error?.error?.message ?? 'No fue posible guardar la mascota.', 'error');
      }
    });
  }

  // Solicita confirmación y elimina la mascota seleccionada.
  eliminar(mascota: Mascota) {
    Swal.fire({
      title: '¿Eliminar mascota?',
      text: `Se eliminará la mascota "${mascota.nombreMascota}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((resultado) => {
      if (!resultado.isConfirmed) {
        return;
      }
      this.mascotaService.eliminarMascota(mascota.mascotaId!).subscribe({
        next: () => {
          Swal.fire('Eliminada', 'La mascota fue eliminada correctamente.', 'success');
          this.listar();
        },
        error: (error) => {
          console.error('Error al eliminar la mascota:', error);
          Swal.fire('Error', error?.error?.message ?? 'No fue posible eliminar la mascota.', 'error');
        }
      });
    });
  }

  // Evento para abrir el modal de crear mascota.
  nuevaMascota() {
    this.mascotaSelected = null;
    this.resetFormulario();
    this.openModal('C');
  }

  resetFormulario() {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  abrirEdicion(mascota: Mascota) {
    this.mascotaSelected = mascota;
    this.resetFormulario();
    this.form.patchValue({
      nombreMascota: mascota.nombreMascota,
      raza: mascota.raza,
      edad: mascota.edad,
      cliente: mascota.cliente
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
    this.titleModal = modo === 'C' ? 'Crear Mascota' : 'Editar Mascota';
    this.titleBoton = modo === 'C' ? 'Guardar Mascota' : 'Actualizar Mascota';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearMascota');
    if (modalElement) {
      // Verificar si ya existe una instancia del modal
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }


}
