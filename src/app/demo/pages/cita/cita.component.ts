import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { CitaServiceService } from './service/cita-service.service';
import { ClienteServiceService } from '../cliente/service/cliente-service.service';
import { MascotaServiceService } from '../mascota/service/mascota-service.service';
import { MedicosServiceService } from '../medicos/service/medicos-service.service';
import { CitaMedica } from 'src/app/models/cita-medica';
import { CitaRq } from 'src/app/models/cita-rq';
import { Cliente } from 'src/app/models/cliente';
import { Mascota } from 'src/app/models/mascota';
import { Medico } from 'src/app/models/medico';
import { TablaDatos } from 'src/app/utils/tabla-datos';
import { ModalBootstrap } from 'src/app/utils/modal-bootstrap';
import { confirmar, mostrarAdvertencia, mostrarError, mostrarExito } from 'src/app/utils/mensajes.util';
import { estaEnRango, hoy, separarFechaHora, unirFechaHora } from 'src/app/utils/fechas.util';
import { PaginadorComponent } from '../../shared/paginador/paginador.component';

/** Datos del formulario de cita (fecha y hora van separadas en la pantalla). */
interface FormularioCita {
  id?: number;
  clienteId?: number;
  mascotaId?: number;
  medicoId?: number;
  fecha: string;
  hora: string;
  motivo: string;
  estado: string;
}

/**
 * Pantalla de gestion de citas medicas:
 * listado (filtros, orden y paginacion), creacion, edicion y reactivacion.
 */
@Component({
  selector: 'app-cita',
  imports: [CommonModule, FormsModule, PaginadorComponent],
  templateUrl: './cita.component.html',
  styleUrl: './cita.component.scss'
})
export class CitaComponent {

  /** Todos los estados de una cita (para el filtro y la edicion). */
  readonly estados = ['PENDIENTE', 'PROGRAMADA', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA'];

  /** Estados permitidos al crear una cita nueva. */
  readonly estadosIniciales = ['PENDIENTE', 'PROGRAMADA', 'CONFIRMADA'];

  /** Fecha minima para el input de fecha (hoy). */
  readonly fechaMinima = hoy();

  // ---- Filtros adicionales de la tabla ----
  filtroEstado = '';
  filtroDesde = '';
  filtroHasta = '';

  /** DataTable de citas: inicia ordenada por fecha descendente. */
  tabla = new TablaDatos<CitaMedica>(
    (c, columna) => this.valorColumna(c, columna),
    c => `${this.nombreCliente(c)} ${c.mascota?.nombreMascota} ${c.medico?.nombres} ${c.medico?.apellidos} ${c.motivo} ${c.estado}`,
    c => (!this.filtroEstado || c.estado === this.filtroEstado)
      && estaEnRango(c.fechaHora, this.filtroDesde, this.filtroHasta)
  );

  /** Indica que se esta cargando el listado (estado de carga). */
  cargando = false;

  /** Indica que se esta guardando (evita doble clic). */
  guardando = false;

  // ---- Datos para los combos ----
  listClientes: Cliente[] = [];
  listMascotas: Mascota[] = [];
  listMedicos: Medico[] = [];
  cargandoMascotas = false;

  // ---- Formulario ----
  modal = new ModalBootstrap('modalCita');
  modoEdicion = false;
  form: FormularioCita = this.formularioVacio();

  constructor(
    private readonly citaService: CitaServiceService,
    private readonly clienteService: ClienteServiceService,
    private readonly mascotaService: MascotaServiceService,
    private readonly medicoService: MedicosServiceService
  ) {
    this.tabla.columnaOrden = 'fecha';
    this.tabla.direccionOrden = 'desc';
    this.listar();
    this.cargarCombos();
  }

  /** Consulta todas las citas en el backend. */
  listar(): void {
    this.cargando = true;
    this.citaService.listarCitas().subscribe({
      next: (data) => {
        this.tabla.setDatos(data);
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        mostrarError(error);
      }
    });
  }

  /** Carga los clientes y veterinarios para los combos del formulario. */
  cargarCombos(): void {
    this.clienteService.getClientes().subscribe({
      next: (data) => this.listClientes = data,
      error: (error) => mostrarError(error)
    });
    this.medicoService.getMedicos().subscribe({
      next: (data) => this.listMedicos = data,
      error: (error) => mostrarError(error)
    });
  }

  /**
   * Combo dependiente: al cambiar el cliente se consultan SOLO sus mascotas
   * y se limpia la mascota elegida antes.
   */
  cambiarCliente(): void {
    this.form.mascotaId = undefined;
    this.cargarMascotasDelCliente();
  }

  /** Consulta en el backend las mascotas del cliente seleccionado. */
  cargarMascotasDelCliente(): void {
    this.listMascotas = [];
    if (!this.form.clienteId) {
      return;
    }
    this.cargandoMascotas = true;
    this.mascotaService.getMascotasPorCliente(this.form.clienteId).subscribe({
      next: (data) => {
        this.listMascotas = data;
        this.cargandoMascotas = false;
      },
      error: (error) => {
        this.cargandoMascotas = false;
        mostrarError(error);
      }
    });
  }

  /** Abre el formulario vacio para crear una cita. */
  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.form = this.formularioVacio();
    this.listMascotas = [];
    this.modal.abrir();
  }

  /** Abre el formulario con los datos de una cita para editarla. */
  abrirModalEditar(cita: CitaMedica): void {
    this.modoEdicion = true;
    const { fecha, hora } = separarFechaHora(cita.fechaHora);
    this.form = {
      id: cita.id,
      clienteId: cita.mascota?.cliente?.id,
      mascotaId: cita.mascota?.mascotaId,
      medicoId: cita.medico?.id,
      fecha,
      hora,
      motivo: cita.motivo ?? '',
      estado: cita.estado ?? 'PENDIENTE'
    };
    this.cargarMascotasDelCliente();
    this.modal.abrir();
  }

  /** Valida el formulario y envia la cita al backend (crear o actualizar). */
  guardar(formulario: NgForm): void {
    if (formulario.invalid) {
      formulario.form.markAllAsTouched();
      mostrarAdvertencia('Complete todos los campos obligatorios.');
      return;
    }
    const fechaHora = unirFechaHora(this.form.fecha, this.form.hora);
    if (!this.modoEdicion && new Date(fechaHora) < new Date()) {
      mostrarAdvertencia('No se pueden registrar citas en fechas u horas anteriores a la actual.');
      return;
    }

    const cita: CitaRq = {
      id: this.form.id,
      clienteId: this.form.clienteId,
      mascotaId: this.form.mascotaId,
      medicoId: this.form.medicoId,
      fechaHora,
      motivo: this.form.motivo.trim(),
      estado: this.form.estado
    };
    const peticion = this.modoEdicion
      ? this.citaService.actualizarCita(cita)
      : this.citaService.crearCita(cita);

    this.guardando = true;
    peticion.subscribe({
      next: (respuesta) => {
        this.guardando = false;
        this.modal.cerrar();
        mostrarExito(respuesta.message ?? 'Cita guardada correctamente');
        this.listar();
      },
      error: (error) => {
        this.guardando = false;
        mostrarError(error);
      }
    });
  }

  /** Reactiva una cita cancelada (operacion explicita, pide confirmacion). */
  async reactivar(cita: CitaMedica): Promise<void> {
    const acepta = await confirmar('¿Reactivar la cita?', 'La cita volverá a quedar en estado PENDIENTE.');
    if (!acepta || !cita.id) {
      return;
    }
    this.citaService.reactivarCita(cita.id).subscribe({
      next: (respuesta) => {
        mostrarExito(respuesta.message ?? 'Cita reactivada');
        this.listar();
      },
      error: (error) => mostrarError(error)
    });
  }

  /** Limpia todos los filtros de la tabla. */
  limpiarFiltros(): void {
    this.tabla.filtroTexto = '';
    this.filtroEstado = '';
    this.filtroDesde = '';
    this.filtroHasta = '';
    this.tabla.reiniciarPagina();
  }

  /** Una cita cancelada o atendida ya no se puede editar. */
  esEditable(cita: CitaMedica): boolean {
    return cita.estado !== 'CANCELADA' && cita.estado !== 'ATENDIDA';
  }

  /** Clase de color (badge) segun el estado. */
  claseEstado(estado?: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'bg-secondary';
      case 'PROGRAMADA': return 'bg-info';
      case 'CONFIRMADA': return 'bg-primary';
      case 'ATENDIDA': return 'bg-success';
      case 'CANCELADA': return 'bg-danger';
      default: return 'bg-light text-dark';
    }
  }

  /** Nombre completo del cliente dueño de la mascota de la cita. */
  nombreCliente(cita: CitaMedica): string {
    const cliente = cita.mascota?.cliente;
    return cliente ? `${cliente.nombres} ${cliente.apellidos}` : '';
  }

  /** Valor de cada columna para poder ordenarla. */
  private valorColumna(cita: CitaMedica, columna: string): unknown {
    switch (columna) {
      case 'fecha': return cita.fechaHora;
      case 'hora': return cita.fechaHora?.substring(11, 16);
      case 'cliente': return this.nombreCliente(cita);
      case 'mascota': return cita.mascota?.nombreMascota;
      case 'veterinario': return `${cita.medico?.nombres} ${cita.medico?.apellidos}`;
      case 'estado': return cita.estado;
      default: return '';
    }
  }

  /** Formulario vacio para una cita nueva. */
  private formularioVacio(): FormularioCita {
    return { fecha: '', hora: '', motivo: '', estado: 'PENDIENTE' };
  }
}
