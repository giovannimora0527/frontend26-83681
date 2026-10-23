import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HistoriaMedicaServiceService } from './service/historia-medica-service.service';
import { AnotacionHistoriaServiceService } from '../anotacion-historia/service/anotacion-historia-service.service';
import { CitaServiceService } from '../cita/service/cita-service.service';
import { ClienteServiceService } from '../cliente/service/cliente-service.service';
import { MascotaServiceService } from '../mascota/service/mascota-service.service';
import { MedicosServiceService } from '../medicos/service/medicos-service.service';
import { HistoriaClinica } from 'src/app/models/historia-clinica';
import { HistoriaClinicaRq } from 'src/app/models/historia-clinica-rq';
import { AnotacionHistoria } from 'src/app/models/anotacion-historia';
import { AnotacionRq } from 'src/app/models/anotacion-rq';
import { CitaMedica } from 'src/app/models/cita-medica';
import { Cliente } from 'src/app/models/cliente';
import { Mascota } from 'src/app/models/mascota';
import { Medico } from 'src/app/models/medico';
import { TablaDatos } from 'src/app/utils/tabla-datos';
import { ModalBootstrap } from 'src/app/utils/modal-bootstrap';
import { confirmar, mostrarAdvertencia, mostrarError, mostrarExito } from 'src/app/utils/mensajes.util';
import { aFormatoBackend, ahora, estaEnRango } from 'src/app/utils/fechas.util';
import { PaginadorComponent } from '../../shared/paginador/paginador.component';
import { TablaAnotacionesComponent } from '../../shared/tabla-anotaciones/tabla-anotaciones.component';

/**
 * Pantalla de historias clinicas:
 * listado (filtros, orden, paginacion), creacion a partir de una cita atendida
 * y modal "Ver" con el detalle y el historico de anotaciones.
 */
@Component({
  selector: 'app-historia-medica',
  imports: [CommonModule, FormsModule, PaginadorComponent, TablaAnotacionesComponent],
  templateUrl: './historia-medica.component.html',
  styleUrl: './historia-medica.component.scss'
})
export class HistoriaMedicaComponent {

  // ---- Filtros adicionales ----
  filtroEstado = '';
  filtroDesde = '';
  filtroHasta = '';

  /** DataTable de historias: inicia por fecha de consulta descendente. */
  tabla = new TablaDatos<HistoriaClinica>(
    (h, columna) => this.valorColumna(h, columna),
    h => `${h.mascota?.nombreMascota} ${this.nombreCliente(h)} ${h.medico?.nombres} ${h.medico?.apellidos} ${h.motivo} ${h.diagnostico}`,
    h => (!this.filtroEstado || h.estado === this.filtroEstado)
      && estaEnRango(h.fechaConsulta, this.filtroDesde, this.filtroHasta)
  );

  cargando = false;
  guardando = false;

  // ---- Combos del formulario de creacion ----
  listClientes: Cliente[] = [];
  listMascotas: Mascota[] = [];
  listCitas: CitaMedica[] = [];
  listMedicos: Medico[] = [];

  /** Ids de las citas que ya tienen historia (para no ofrecerlas otra vez). */
  private citasConHistoria = new Set<number>();

  // ---- Formulario de creacion ----
  modalCrear = new ModalBootstrap('modalHistoria');
  form: HistoriaClinicaRq = {};
  fechaHoraForm = '';
  readonly fechaMaxima = ahora();

  // ---- Modal Ver (detalle + anotaciones) ----
  modalVer = new ModalBootstrap('modalVerHistoria');
  historiaSeleccionada: HistoriaClinica | null = null;
  anotaciones: AnotacionHistoria[] = [];
  cargandoAnotaciones = false;
  verHistorialCompleto = false;
  mostrarFormAnotacion = false;
  formAnotacion: AnotacionRq = {};

  constructor(
    private readonly historiaService: HistoriaMedicaServiceService,
    private readonly anotacionService: AnotacionHistoriaServiceService,
    private readonly citaService: CitaServiceService,
    private readonly clienteService: ClienteServiceService,
    private readonly mascotaService: MascotaServiceService,
    private readonly medicoService: MedicosServiceService
  ) {
    this.tabla.columnaOrden = 'fecha';
    this.tabla.direccionOrden = 'desc';
    this.listar();
    this.clienteService.getClientes().subscribe({ next: d => this.listClientes = d, error: e => mostrarError(e) });
    this.medicoService.getMedicos().subscribe({ next: d => this.listMedicos = d, error: e => mostrarError(e) });
  }

  /** Consulta todas las historias clinicas. */
  listar(): void {
    this.cargando = true;
    this.historiaService.listarHistorias().subscribe({
      next: (data) => {
        this.tabla.setDatos(data);
        this.citasConHistoria = new Set(data.map(h => h.cita?.id ?? 0));
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        mostrarError(error);
      }
    });
  }

  // =================== CREAR HISTORIA ===================

  /** Abre el formulario vacio. */
  abrirModalNuevo(): void {
    this.form = {};
    this.fechaHoraForm = '';
    this.listMascotas = [];
    this.listCitas = [];
    this.modalCrear.abrir();
  }

  /** Combo dependiente: cliente -> mascotas del cliente. */
  cambiarCliente(): void {
    this.form.mascotaId = undefined;
    this.form.citaId = undefined;
    this.listMascotas = [];
    this.listCitas = [];
    if (!this.form.clienteId) {
      return;
    }
    this.mascotaService.getMascotasPorCliente(this.form.clienteId).subscribe({
      next: d => this.listMascotas = d,
      error: e => mostrarError(e)
    });
  }

  /**
   * Combo dependiente: mascota -> citas ATENDIDAS de esa mascota
   * que todavia no tienen historia clinica.
   */
  cambiarMascota(): void {
    this.form.citaId = undefined;
    this.listCitas = [];
    if (!this.form.mascotaId) {
      return;
    }
    this.citaService.listarCitasPorMascota(this.form.mascotaId).subscribe({
      next: d => this.listCitas = d.filter(c => c.estado === 'ATENDIDA' && !this.citasConHistoria.has(c.id ?? 0)),
      error: e => mostrarError(e)
    });
  }

  /** Al elegir la cita se proponen su veterinario, motivo y fecha. */
  cambiarCita(): void {
    const cita = this.listCitas.find(c => c.id === this.form.citaId);
    if (cita) {
      this.form.medicoId = cita.medico?.id;
      this.form.motivo = cita.motivo;
      this.fechaHoraForm = (cita.fechaHora ?? '').substring(0, 16);
    }
  }

  /** Valida y envia la historia al backend. */
  guardar(formulario: NgForm): void {
    if (formulario.invalid) {
      formulario.form.markAllAsTouched();
      mostrarAdvertencia('Complete todos los campos obligatorios.');
      return;
    }
    const historia: HistoriaClinicaRq = {
      ...this.form,
      fechaHora: this.fechaHoraForm ? aFormatoBackend(this.fechaHoraForm) : undefined
    };
    this.guardando = true;
    this.historiaService.crearHistoria(historia).subscribe({
      next: (respuesta) => {
        this.guardando = false;
        this.modalCrear.cerrar();
        mostrarExito(respuesta.message ?? 'Historia creada');
        this.listar();
      },
      error: (error) => {
        this.guardando = false;
        mostrarError(error);
      }
    });
  }

  // =================== VER HISTORIA Y ANOTACIONES ===================

  /** Abre el detalle de la historia con su historico de anotaciones. */
  ver(historia: HistoriaClinica): void {
    this.historiaSeleccionada = historia;
    this.verHistorialCompleto = false;
    this.mostrarFormAnotacion = false;
    this.cargarAnotaciones();
    this.modalVer.abrir();
  }

  /**
   * Carga las anotaciones: solo las de esta historia, o todo el
   * historial de la mascota si se marca la casilla.
   */
  cargarAnotaciones(): void {
    const historia = this.historiaSeleccionada;
    if (!historia?.id) {
      return;
    }
    this.cargandoAnotaciones = true;
    const peticion = this.verHistorialCompleto && historia.mascota?.mascotaId
      ? this.anotacionService.listarPorMascota(historia.mascota.mascotaId)
      : this.anotacionService.listarPorHistoria(historia.id);
    peticion.subscribe({
      next: (data) => {
        this.anotaciones = data;
        this.cargandoAnotaciones = false;
      },
      error: (error) => {
        this.cargandoAnotaciones = false;
        mostrarError(error);
      }
    });
  }

  /** Muestra el formulario para agregar una anotacion. */
  nuevaAnotacion(): void {
    this.formAnotacion = {
      historiaId: this.historiaSeleccionada?.id,
      medicoId: this.historiaSeleccionada?.medico?.id
    };
    this.mostrarFormAnotacion = true;
  }

  /** Envia la anotacion al backend. */
  guardarAnotacion(formulario: NgForm): void {
    if (formulario.invalid) {
      formulario.form.markAllAsTouched();
      mostrarAdvertencia('Complete los campos obligatorios de la anotación.');
      return;
    }
    this.guardando = true;
    this.anotacionService.crearAnotacion(this.formAnotacion).subscribe({
      next: (respuesta) => {
        this.guardando = false;
        this.mostrarFormAnotacion = false;
        mostrarExito(respuesta.message ?? 'Anotación agregada');
        this.cargarAnotaciones();
      },
      error: (error) => {
        this.guardando = false;
        mostrarError(error);
      }
    });
  }

  /** Cierra la historia para que no reciba mas anotaciones. */
  async cerrarHistoria(): Promise<void> {
    const historia = this.historiaSeleccionada;
    if (!historia?.id) {
      return;
    }
    const acepta = await confirmar('¿Cerrar la historia clínica?', 'Después de cerrarla no se podrán agregar anotaciones.');
    if (!acepta) {
      return;
    }
    this.historiaService.cerrarHistoria(historia.id).subscribe({
      next: (respuesta) => {
        historia.estado = 'CERRADA';
        this.mostrarFormAnotacion = false;
        mostrarExito(respuesta.message ?? 'Historia cerrada');
        this.listar();
      },
      error: (error) => mostrarError(error)
    });
  }

  // =================== AYUDAS ===================

  /** Limpia todos los filtros. */
  limpiarFiltros(): void {
    this.tabla.filtroTexto = '';
    this.filtroEstado = '';
    this.filtroDesde = '';
    this.filtroHasta = '';
    this.tabla.reiniciarPagina();
  }

  /** Nombre del cliente dueño de la mascota. */
  nombreCliente(historia: HistoriaClinica): string {
    const cliente = historia.mascota?.cliente;
    return cliente ? `${cliente.nombres} ${cliente.apellidos}` : '';
  }

  /** Valor de cada columna para ordenar. */
  private valorColumna(h: HistoriaClinica, columna: string): unknown {
    switch (columna) {
      case 'fecha': return h.fechaConsulta;
      case 'mascota': return h.mascota?.nombreMascota;
      case 'cliente': return this.nombreCliente(h);
      case 'veterinario': return `${h.medico?.nombres} ${h.medico?.apellidos}`;
      case 'motivo': return h.motivo;
      case 'estado': return h.estado;
      default: return '';
    }
  }
}
