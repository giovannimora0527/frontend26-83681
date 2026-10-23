import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize } from 'rxjs';
import { Modal } from 'bootstrap';

import { HistoriaMedicaService } from './service/historia-medica.service';
import { CitaService } from '../cita/service/cita.service';
import { ClienteService } from '../cliente/service/cliente.service';
import { MedicosServiceService } from '../medicos/service/medicos-service.service';
import { AnotacionesHistorialComponent } from './anotaciones/anotaciones-historial.component';
import { Cita } from 'src/app/models/cita';
import { Cliente } from 'src/app/models/cliente';
import { HistoriaMedica } from 'src/app/models/historia-medica';
import { Mascota } from 'src/app/models/mascota';
import { Medico } from 'src/app/models/medico';
import { PaginaRs } from 'src/app/models/pagina';
import { HistoriaMedicaRq } from 'src/app/models/requests';
import { TablaPaginada } from 'src/app/shared/tabla-paginada';
import { PaginacionComponent } from 'src/app/shared/components/paginacion/paginacion.component';
import { ColumnaOrdenableComponent } from 'src/app/shared/components/columna-ordenable/columna-ordenable.component';
import { EstadoBadgeComponent } from 'src/app/shared/components/estado-badge/estado-badge.component';
import { CargandoComponent } from 'src/app/shared/components/cargando/cargando.component';
import { aFechaHoraBackend, aInputFechaHora, ahora, soloFecha } from 'src/app/utils/fecha.util';
import { confirmar, notificarAdvertencia, notificarError, notificarExito } from 'src/app/utils/notificacion.util';
import { fechaHoraNoFutura, noSoloEspacios } from 'src/app/utils/validadores';

/**
 * Pantalla de historias clínicas: listado paginado (más recientes primero),
 * creación a partir de una cita atendida con combos dependientes
 * Cliente → Mascota → Cita, detalle con el histórico de anotaciones y cierre.
 */
@Component({
  selector: 'app-historia-medica',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PaginacionComponent, ColumnaOrdenableComponent,
    EstadoBadgeComponent, CargandoComponent, AnotacionesHistorialComponent],
  templateUrl: './historia-medica.component.html',
  styleUrl: './historia-medica.component.scss'
})
export class HistoriaMedicaComponent extends TablaPaginada<HistoriaMedica> implements OnInit {
  // Filtros del DataTable.
  filtroTexto = '';
  filtroEstado = '';
  filtroMedicoId: number | null = null;
  filtroDesde = '';
  filtroHasta = '';

  // Catálogos para los combos dependientes.
  clientes: Cliente[] = [];
  medicos: Medico[] = [];
  mascotasCliente: Mascota[] = [];
  citasDisponibles: Cita[] = [];
  cargandoMascotas = false;
  cargandoCitas = false;

  /** Formulario de creación. */
  form: FormGroup;
  /** Indica si se está guardando. */
  guardando = false;
  /** Historia mostrada en el modal de detalle. */
  historiaDetalle: HistoriaMedica | null = null;
  /** Indica si se está consultando el detalle. */
  cargandoDetalle = false;

  protected readonly mensajeErrorConsulta = 'No fue posible consultar las historias clínicas.';

  constructor(
    private readonly historiaService: HistoriaMedicaService,
    private readonly citaService: CitaService,
    private readonly clienteService: ClienteService,
    private readonly medicosService: MedicosServiceService,
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    super({ columna: 'fecha', direccion: 'desc' });
    this.form = this.formBuilder.group({
      clienteId: [null, Validators.required],
      mascotaId: [{ value: null, disabled: true }, Validators.required],
      citaId: [{ value: null, disabled: true }, Validators.required],
      medicoId: [null, Validators.required],
      fechaConsulta: ['', [Validators.required, fechaHoraNoFutura]],
      motivoConsulta: ['', [Validators.required, Validators.maxLength(255), noSoloEspacios]],
      diagnostico: ['', [Validators.required, Validators.maxLength(2000), noSoloEspacios]],
      observaciones: ['', Validators.maxLength(2000)]
    });

    // Combos dependientes: Cliente → Mascotas del cliente → Citas atendidas de la mascota.
    this.form.get('clienteId')!.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((clienteId: number | null) => this.cargarMascotas(clienteId));
    this.form.get('mascotaId')!.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((mascotaId: number | null) => this.cargarCitas(mascotaId));
    this.form.get('citaId')!.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((citaId: number | null) => this.sugerirDatosDeCita(citaId));
  }

  /** Carga el listado, los catálogos y revisa si se llegó desde una cita atendida. */
  ngOnInit(): void {
    this.cargar();
    this.cargarCatalogos();
    const citaId = Number(this.route.snapshot.queryParamMap.get('citaId'));
    if (citaId) {
      this.precargarDesdeCita(citaId);
    }
  }

  /** Acceso corto a los controles del formulario. */
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  /** Cita seleccionada en el formulario. */
  get citaSeleccionada(): Cita | undefined {
    return this.citasDisponibles.find((cita) => cita.citaId === this.form.get('citaId')!.value);
  }

  /** Fecha mínima de la consulta: el día de la cita seleccionada. */
  get fechaMinimaConsulta(): string {
    const cita = this.citaSeleccionada;
    return cita ? `${soloFecha(cita.fechaCita)}T00:00` : '';
  }

  /** Fecha máxima de la consulta: ahora. */
  get fechaMaxima(): string {
    return ahora();
  }

  /** {@inheritDoc} */
  protected consultar(params: HttpParams): Observable<PaginaRs<HistoriaMedica>> {
    return this.historiaService.listar(params);
  }

  /** {@inheritDoc} */
  protected filtros(): Record<string, unknown> {
    return {
      texto: this.filtroTexto,
      estado: this.filtroEstado,
      medicoId: this.filtroMedicoId,
      fechaDesde: this.filtroDesde,
      fechaHasta: this.filtroHasta
    };
  }

  /** Quita los filtros y vuelve al orden inicial. */
  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroEstado = '';
    this.filtroMedicoId = null;
    this.filtroDesde = '';
    this.filtroHasta = '';
    this.restablecerOrden();
    this.buscar();
  }

  /** Carga clientes y veterinarios. */
  private cargarCatalogos(): void {
    this.clienteService.getClientes().subscribe({
      next: (clientes) => this.clientes = clientes.filter((cliente) => cliente.activo !== false),
      error: (error) => notificarError(error, 'No fue posible cargar los clientes.')
    });
    this.medicosService.getMedicos().subscribe({
      next: (medicos) => this.medicos = medicos,
      error: (error) => notificarError(error, 'No fue posible cargar los veterinarios.')
    });
  }

  /**
   * Consulta las mascotas del cliente y limpia la mascota y la cita seleccionadas.
   * @param clienteId Cliente seleccionado.
   * @param alTerminar Acción opcional cuando termina la carga (usada al precargar desde una cita).
   */
  private cargarMascotas(clienteId: number | null, alTerminar?: () => void): void {
    const mascota = this.form.get('mascotaId')!;
    mascota.reset(null);
    this.mascotasCliente = [];
    if (!clienteId) {
      mascota.disable();
      return;
    }
    this.cargandoMascotas = true;
    this.clienteService.getMascotasCliente(clienteId).pipe(finalize(() => this.cargandoMascotas = false)).subscribe({
      next: (mascotas) => {
        this.mascotasCliente = mascotas;
        mascota.enable({ emitEvent: false });
        alTerminar?.();
      },
      error: (error) => notificarError(error, 'No fue posible cargar las mascotas del cliente.')
    });
  }

  /**
   * Consulta las citas atendidas de la mascota que aún no tienen historia.
   * @param mascotaId Mascota seleccionada.
   * @param alTerminar Acción opcional cuando termina la carga.
   */
  private cargarCitas(mascotaId: number | null, alTerminar?: () => void): void {
    const cita = this.form.get('citaId')!;
    cita.reset(null);
    this.citasDisponibles = [];
    if (!mascotaId) {
      cita.disable();
      return;
    }
    this.cargandoCitas = true;
    this.citaService.atendidasSinHistoria(mascotaId).pipe(finalize(() => this.cargandoCitas = false)).subscribe({
      next: (citas) => {
        this.citasDisponibles = citas;
        cita.enable({ emitEvent: false });
        alTerminar?.();
      },
      error: (error) => notificarError(error, 'No fue posible cargar las citas de la mascota.')
    });
  }

  /**
   * Al elegir la cita, sugiere su veterinario, fecha y motivo (el usuario puede ajustarlos).
   * @param citaId Cita seleccionada.
   */
  private sugerirDatosDeCita(citaId: number | null): void {
    const cita = this.citasDisponibles.find((item) => item.citaId === citaId);
    if (!cita) {
      return;
    }
    this.form.patchValue({
      medicoId: cita.medico.id,
      fechaConsulta: aInputFechaHora(cita.fechaCita) > ahora() ? ahora() : aInputFechaHora(cita.fechaCita),
      motivoConsulta: cita.motivo
    });
  }

  /** Abre el formulario vacío para crear una historia. */
  nuevaHistoria(): void {
    this.form.reset();
    this.abrirModal('modalFormularioHistoria');
  }

  /**
   * Abre el formulario ya diligenciado con el cliente, la mascota y la cita
   * indicada (se usa al marcar una cita como atendida desde la pantalla de citas).
   * @param citaId Cita atendida.
   */
  private precargarDesdeCita(citaId: number): void {
    this.citaService.consultar(citaId).subscribe({
      next: (cita) => {
        this.form.reset();
        this.abrirModal('modalFormularioHistoria');
        this.form.get('clienteId')!.setValue(cita.mascota.cliente?.id ?? null, { emitEvent: false });
        this.cargarMascotas(cita.mascota.cliente?.id ?? null, () => {
          this.form.get('mascotaId')!.setValue(cita.mascota.mascotaId, { emitEvent: false });
          this.cargarCitas(cita.mascota.mascotaId ?? null, () => this.form.get('citaId')!.setValue(cita.citaId));
        });
        // Se limpia el parámetro para que al recargar no se abra de nuevo el formulario.
        this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
      },
      error: (error) => notificarError(error, 'No fue posible consultar la cita atendida.')
    });
  }

  /** Envía la historia clínica al backend. */
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valores = this.form.getRawValue();
    if (valores.fechaConsulta < this.fechaMinimaConsulta) {
      notificarAdvertencia('Fecha inválida', 'La fecha de la consulta no puede ser anterior a la fecha de la cita.');
      return;
    }
    const rq: HistoriaMedicaRq = {
      clienteId: valores.clienteId,
      mascotaId: valores.mascotaId,
      citaId: valores.citaId,
      medicoId: valores.medicoId,
      fechaConsulta: aFechaHoraBackend(valores.fechaConsulta),
      motivoConsulta: valores.motivoConsulta.trim(),
      diagnostico: valores.diagnostico.trim(),
      observaciones: valores.observaciones?.trim() || null
    };
    this.guardando = true;
    this.historiaService.crear(rq).pipe(finalize(() => this.guardando = false)).subscribe({
      next: (respuesta) => {
        notificarExito(respuesta.message);
        this.cerrarModal('modalFormularioHistoria');
        this.cargar();
      },
      error: (error) => notificarError(error, 'No fue posible guardar la historia clínica.')
    });
  }

  /**
   * Consulta la historia y abre el modal con su detalle y el histórico de anotaciones.
   * @param historia Historia seleccionada.
   */
  verDetalle(historia: HistoriaMedica): void {
    this.historiaDetalle = null;
    this.cargandoDetalle = true;
    this.abrirModal('modalDetalleHistoria');
    this.historiaService.consultar(historia.historiaId).pipe(finalize(() => this.cargandoDetalle = false)).subscribe({
      next: (detalle) => this.historiaDetalle = detalle,
      error: (error) => {
        this.cerrarModal('modalDetalleHistoria');
        notificarError(error, 'No fue posible consultar la historia clínica.');
      }
    });
  }

  /**
   * Cierra una historia clínica previa confirmación.
   * @param historia Historia a cerrar.
   */
  async cerrarHistoria(historia: HistoriaMedica): Promise<void> {
    const aceptado = await confirmar('¿Cerrar historia clínica?',
      `La consulta de ${historia.mascota.nombreMascota} ya no admitirá nuevas anotaciones.`, 'Sí, cerrar');
    if (!aceptado) {
      return;
    }
    this.historiaService.cerrar(historia.historiaId).subscribe({
      next: (respuesta) => {
        notificarExito(respuesta.message);
        this.cargar();
        if (this.historiaDetalle?.historiaId === historia.historiaId) {
          this.historiaDetalle = { ...this.historiaDetalle, estado: 'CERRADA' };
        }
      },
      error: (error) => notificarError(error, 'No fue posible cerrar la historia clínica.')
    });
  }

  /**
   * Muestra un modal de Bootstrap.
   * @param id Id del elemento del modal.
   */
  private abrirModal(id: string): void {
    const elemento = document.getElementById(id);
    if (elemento) {
      Modal.getOrCreateInstance(elemento).show();
    }
  }

  /**
   * Oculta un modal de Bootstrap.
   * @param id Id del elemento del modal.
   */
  cerrarModal(id: string): void {
    const elemento = document.getElementById(id);
    if (elemento) {
      Modal.getOrCreateInstance(elemento).hide();
    }
  }
}
