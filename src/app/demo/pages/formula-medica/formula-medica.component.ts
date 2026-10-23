import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { FormulaMedicaServiceService } from './service/formula-medica-service.service';
import { CitaServiceService } from '../cita/service/cita-service.service';
import { ClienteServiceService } from '../cliente/service/cliente-service.service';
import { MascotaServiceService } from '../mascota/service/mascota-service.service';
import { MedicosServiceService } from '../medicos/service/medicos-service.service';
import { FormulaMedica } from 'src/app/models/formula-medica';
import { FormulaMedicaRq } from 'src/app/models/formula-medica-rq';
import { CitaMedica } from 'src/app/models/cita-medica';
import { Cliente } from 'src/app/models/cliente';
import { Mascota } from 'src/app/models/mascota';
import { Medico } from 'src/app/models/medico';
import { TablaDatos } from 'src/app/utils/tabla-datos';
import { ModalBootstrap } from 'src/app/utils/modal-bootstrap';
import { confirmar, mostrarAdvertencia, mostrarError, mostrarExito } from 'src/app/utils/mensajes.util';
import { aFormatoBackend, ahora, estaEnRango } from 'src/app/utils/fechas.util';
import { PaginadorComponent } from '../../shared/paginador/paginador.component';

/**
 * Pantalla de formulas medicas:
 * listado resumido (filtros, orden, paginacion), crear, editar, ver detalle e inactivar.
 */
@Component({
  selector: 'app-formula-medica',
  imports: [CommonModule, FormsModule, PaginadorComponent],
  templateUrl: './formula-medica.component.html',
  styleUrl: './formula-medica.component.scss'
})
export class FormulaMedicaComponent {

  /** Unidades de dosis permitidas (las mismas que valida el backend). */
  readonly unidadesDosis = ['mg', 'g', 'ml', 'mg/kg', 'tableta', 'gotas', 'UI'];

  /** Sugerencias para el campo frecuencia. */
  readonly frecuenciasSugeridas = ['Cada 6 horas', 'Cada 8 horas', 'Cada 12 horas', 'Cada 24 horas', 'Dosis única'];

  // ---- Filtros adicionales ----
  filtroEstado = '';
  filtroDesde = '';
  filtroHasta = '';

  /** DataTable de formulas: inicia por fecha de creacion descendente (las mas recientes primero). */
  tabla = new TablaDatos<FormulaMedica>(
    (f, columna) => this.valorColumna(f, columna),
    f => `${f.mascota?.nombreMascota} ${this.nombreCliente(f)} ${f.medicamento} ${f.medico?.nombres} ${f.medico?.apellidos}`,
    f => (!this.filtroEstado || (this.filtroEstado === 'ACTIVA') === !!f.activo)
      && estaEnRango(f.fechaCreacion, this.filtroDesde, this.filtroHasta)
  );

  cargando = false;
  guardando = false;

  // ---- Combos ----
  listClientes: Cliente[] = [];
  listMascotas: Mascota[] = [];
  listCitas: CitaMedica[] = [];
  listMedicos: Medico[] = [];

  // ---- Formulario crear / editar ----
  modalForm = new ModalBootstrap('modalFormula');
  modoEdicion = false;
  form: FormulaMedicaRq = {};
  fechaEmisionForm = '';
  fechaMaxima = ahora();

  // ---- Modal ver detalle ----
  modalVer = new ModalBootstrap('modalVerFormula');
  formulaSeleccionada: FormulaMedica | null = null;

  constructor(
    private readonly formulaService: FormulaMedicaServiceService,
    private readonly citaService: CitaServiceService,
    private readonly clienteService: ClienteServiceService,
    private readonly mascotaService: MascotaServiceService,
    private readonly medicoService: MedicosServiceService
  ) {
    this.tabla.columnaOrden = 'creada';
    this.tabla.direccionOrden = 'desc';
    this.listar();
    this.clienteService.getClientes().subscribe({ next: d => this.listClientes = d, error: e => mostrarError(e) });
    this.medicoService.getMedicos().subscribe({ next: d => this.listMedicos = d, error: e => mostrarError(e) });
  }

  /** Consulta todas las formulas. */
  listar(): void {
    this.cargando = true;
    this.formulaService.listarFormulas().subscribe({
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

  // =================== CREAR / EDITAR ===================

  /** Abre el formulario vacio para una formula nueva. */
  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.form = {};
    this.fechaMaxima = ahora();
    this.fechaEmisionForm = this.fechaMaxima;
    this.listMascotas = [];
    this.listCitas = [];
    this.modalForm.abrir();
  }

  /**
   * Abre el formulario para editar. Cliente, mascota, cita y veterinario
   * se muestran bloqueados porque no se pueden cambiar.
   */
  abrirModalEditar(formula: FormulaMedica): void {
    this.modoEdicion = true;
    this.fechaMaxima = ahora();
    this.form = {
      id: formula.id,
      clienteId: formula.mascota?.cliente?.id,
      mascotaId: formula.mascota?.mascotaId,
      citaId: formula.cita?.id,
      medicoId: formula.medico?.id,
      medicamento: formula.medicamento,
      dosisCantidad: formula.dosisCantidad,
      dosisUnidad: formula.dosisUnidad,
      frecuencia: formula.frecuencia,
      duracionDias: formula.duracionDias,
      indicaciones: formula.indicaciones
    };
    this.fechaEmisionForm = (formula.fechaEmision ?? '').substring(0, 16);
    // En edicion los combos solo necesitan mostrar los valores actuales
    this.listMascotas = formula.mascota ? [formula.mascota] : [];
    this.listCitas = formula.cita ? [formula.cita] : [];
    this.modalForm.abrir();
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

  /** Combo dependiente: mascota -> citas ATENDIDAS de esa mascota. */
  cambiarMascota(): void {
    this.form.citaId = undefined;
    this.listCitas = [];
    if (!this.form.mascotaId) {
      return;
    }
    this.citaService.listarCitasPorMascota(this.form.mascotaId).subscribe({
      next: d => this.listCitas = d.filter(c => c.estado === 'ATENDIDA'),
      error: e => mostrarError(e)
    });
  }

  /** Al elegir la cita se propone el veterinario que la atendio. */
  cambiarCita(): void {
    const cita = this.listCitas.find(c => c.id === this.form.citaId);
    if (cita) {
      this.form.medicoId = cita.medico?.id;
    }
  }

  /** Fecha minima de emision: la fecha de la cita seleccionada (regla 4). */
  get fechaMinima(): string {
    const cita = this.listCitas.find(c => c.id === this.form.citaId);
    return (cita?.fechaHora ?? '').substring(0, 16);
  }

  /** Valida y envia la formula al backend. */
  guardar(formulario: NgForm): void {
    if (formulario.invalid) {
      formulario.form.markAllAsTouched();
      mostrarAdvertencia('Revise los campos marcados: hay datos obligatorios vacíos o con valores no válidos.');
      return;
    }
    if (this.fechaMinima && this.fechaEmisionForm < this.fechaMinima) {
      mostrarAdvertencia('La fecha de emisión no puede ser anterior a la fecha de la consulta.');
      return;
    }
    const formula: FormulaMedicaRq = { ...this.form, fechaEmision: aFormatoBackend(this.fechaEmisionForm) };
    const peticion = this.modoEdicion
      ? this.formulaService.actualizarFormula(formula)
      : this.formulaService.crearFormula(formula);

    this.guardando = true;
    peticion.subscribe({
      next: (respuesta) => {
        this.guardando = false;
        this.modalForm.cerrar();
        mostrarExito(respuesta.message ?? 'Fórmula guardada');
        this.listar();
      },
      error: (error) => {
        this.guardando = false;
        mostrarError(error);
      }
    });
  }

  // =================== VER / INACTIVAR ===================

  /** Consulta en el backend el detalle completo y lo muestra en un modal. */
  ver(formula: FormulaMedica): void {
    if (!formula.id) {
      return;
    }
    this.formulaService.consultarFormula(formula.id).subscribe({
      next: (detalle) => {
        this.formulaSeleccionada = detalle;
        this.modalVer.abrir();
      },
      error: (error) => mostrarError(error)
    });
  }

  /** Inactiva la formula (no se borra porque es informacion clinica). */
  async inactivar(formula: FormulaMedica): Promise<void> {
    const acepta = await confirmar('¿Inactivar la fórmula?',
      `La fórmula de ${formula.medicamento} quedará inactiva y no podrá editarse.`);
    if (!acepta || !formula.id) {
      return;
    }
    this.formulaService.inactivarFormula(formula.id).subscribe({
      next: (respuesta) => {
        mostrarExito(respuesta.message ?? 'Fórmula inactivada');
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
  nombreCliente(formula: FormulaMedica): string {
    const cliente = formula.mascota?.cliente;
    return cliente ? `${cliente.nombres} ${cliente.apellidos}` : '';
  }

  /** Valor de cada columna para ordenar. */
  private valorColumna(f: FormulaMedica, columna: string): unknown {
    switch (columna) {
      case 'creada': return f.fechaCreacion;
      case 'mascota': return f.mascota?.nombreMascota;
      case 'cliente': return this.nombreCliente(f);
      case 'medicamento': return f.medicamento;
      case 'veterinario': return `${f.medico?.nombres} ${f.medico?.apellidos}`;
      case 'estado': return f.activo ? 'ACTIVA' : 'INACTIVA';
      default: return '';
    }
  }
}
