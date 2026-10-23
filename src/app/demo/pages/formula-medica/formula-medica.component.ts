import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize } from 'rxjs';
import { Modal } from 'bootstrap';

import { FormulaMedicaService } from './service/formula-medica.service';
import { HistoriaMedicaService } from '../historia-medica/service/historia-medica.service';
import { ClienteService } from '../cliente/service/cliente.service';
import { MedicosServiceService } from '../medicos/service/medicos-service.service';
import { Cliente } from 'src/app/models/cliente';
import { FormulaMedica, FormulaMedicaResumen, UNIDADES_DOSIS } from 'src/app/models/formula-medica';
import { HistoriaMedica } from 'src/app/models/historia-medica';
import { Mascota } from 'src/app/models/mascota';
import { Medico } from 'src/app/models/medico';
import { PaginaRs } from 'src/app/models/pagina';
import { FormulaMedicaRq, MiRespuestaRS } from 'src/app/models/requests';
import { TablaPaginada } from 'src/app/shared/tabla-paginada';
import { PaginacionComponent } from 'src/app/shared/components/paginacion/paginacion.component';
import { ColumnaOrdenableComponent } from 'src/app/shared/components/columna-ordenable/columna-ordenable.component';
import { EstadoBadgeComponent } from 'src/app/shared/components/estado-badge/estado-badge.component';
import { CargandoComponent } from 'src/app/shared/components/cargando/cargando.component';
import { hoy, soloFecha } from 'src/app/utils/fecha.util';
import { confirmar, notificarAdvertencia, notificarError, notificarExito } from 'src/app/utils/notificacion.util';
import { fechaNoFutura, maximoDecimales, noSoloEspacios } from 'src/app/utils/validadores';

/**
 * Pantalla de fórmulas médicas: listado resumido paginado (más recientes
 * primero), detalle completo, creación y edición con combos dependientes
 * Cliente → Mascota → Consulta, e inactivación (no se eliminan físicamente).
 */
@Component({
  selector: 'app-formula-medica',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PaginacionComponent, ColumnaOrdenableComponent,
    EstadoBadgeComponent, CargandoComponent],
  templateUrl: './formula-medica.component.html',
  styleUrl: './formula-medica.component.scss'
})
export class FormulaMedicaComponent extends TablaPaginada<FormulaMedicaResumen> implements OnInit {
  /** Unidades de dosis permitidas. */
  readonly unidades = UNIDADES_DOSIS;
  /** Fecha máxima de emisión (hoy). */
  readonly fechaMaxima = hoy();

  // Filtros del DataTable.
  filtroTexto = '';
  filtroActivo: boolean | null = true;
  filtroMedicoId: number | null = null;
  filtroDesde = '';
  filtroHasta = '';

  // Catálogos de los combos dependientes.
  clientes: Cliente[] = [];
  medicos: Medico[] = [];
  mascotasCliente: Mascota[] = [];
  consultasMascota: HistoriaMedica[] = [];
  cargandoMascotas = false;
  cargandoConsultas = false;

  /** Formulario de creación/edición. */
  form: FormGroup;
  /** Fórmula que se está editando (null al crear). */
  formulaEditada: FormulaMedica | null = null;
  /** Indica si se está guardando. */
  guardando = false;
  /** Fórmula mostrada en el modal de detalle. */
  formulaDetalle: FormulaMedica | null = null;
  /** Indica si se está consultando el detalle. */
  cargandoDetalle = false;

  protected readonly mensajeErrorConsulta = 'No fue posible consultar las fórmulas médicas.';

  constructor(
    private readonly formulaService: FormulaMedicaService,
    private readonly historiaService: HistoriaMedicaService,
    private readonly clienteService: ClienteService,
    private readonly medicosService: MedicosServiceService,
    private readonly formBuilder: FormBuilder
  ) {
    super({ columna: 'creacion', direccion: 'desc' });
    this.form = this.formBuilder.group({
      clienteId: [null, Validators.required],
      mascotaId: [{ value: null, disabled: true }, Validators.required],
      historiaId: [{ value: null, disabled: true }, Validators.required],
      medicoId: [null, Validators.required],
      fechaEmision: [hoy(), [Validators.required, fechaNoFutura]],
      medicamento: ['', [Validators.required, Validators.maxLength(150), noSoloEspacios]],
      dosis: [null, [Validators.required, Validators.min(0.01), Validators.max(10000), maximoDecimales(2)]],
      unidadDosis: ['mg', Validators.required],
      frecuenciaHoras: [null, [Validators.required, Validators.min(1), Validators.max(72), Validators.pattern(/^\d+$/)]],
      duracionDias: [null, [Validators.required, Validators.min(1), Validators.max(365), Validators.pattern(/^\d+$/)]],
      indicaciones: ['', [Validators.required, Validators.maxLength(2000), noSoloEspacios]]
    });

    // Combos dependientes: Cliente → Mascotas del cliente → Consultas (historias) de la mascota.
    this.form.get('clienteId')!.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((clienteId: number | null) => this.cargarMascotas(clienteId));
    this.form.get('mascotaId')!.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((mascotaId: number | null) => this.cargarConsultas(mascotaId));
  }

  /** Carga el listado y los catálogos. */
  ngOnInit(): void {
    this.cargar();
    this.clienteService.getClientes().subscribe({
      next: (clientes) => this.clientes = clientes.filter((cliente) => cliente.activo !== false),
      error: (error) => notificarError(error, 'No fue posible cargar los clientes.')
    });
    this.medicosService.getMedicos().subscribe({
      next: (medicos) => this.medicos = medicos,
      error: (error) => notificarError(error, 'No fue posible cargar los veterinarios.')
    });
  }

  /** Acceso corto a los controles del formulario. */
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  /** Consulta seleccionada en el formulario. */
  get consultaSeleccionada(): HistoriaMedica | undefined {
    return this.consultasMascota.find((historia) => historia.historiaId === this.form.get('historiaId')!.value);
  }

  /** Fecha mínima de emisión: la fecha de la consulta seleccionada. */
  get fechaMinimaEmision(): string {
    const consulta = this.consultaSeleccionada;
    return consulta ? soloFecha(consulta.fechaConsulta) : '';
  }

  /** {@inheritDoc} */
  protected consultar(params: HttpParams): Observable<PaginaRs<FormulaMedicaResumen>> {
    return this.formulaService.listar(params);
  }

  /** {@inheritDoc} */
  protected filtros(): Record<string, unknown> {
    return {
      texto: this.filtroTexto,
      activo: this.filtroActivo,
      medicoId: this.filtroMedicoId,
      fechaDesde: this.filtroDesde,
      fechaHasta: this.filtroHasta
    };
  }

  /** Quita los filtros (deja solo las activas) y vuelve al orden inicial. */
  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroActivo = true;
    this.filtroMedicoId = null;
    this.filtroDesde = '';
    this.filtroHasta = '';
    this.restablecerOrden();
    this.buscar();
  }

  /**
   * Consulta las mascotas del cliente y limpia la mascota y la consulta.
   * @param clienteId Cliente seleccionado.
   */
  private cargarMascotas(clienteId: number | null): void {
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
      },
      error: (error) => notificarError(error, 'No fue posible cargar las mascotas del cliente.')
    });
  }

  /**
   * Consulta las historias clínicas (consultas) de la mascota seleccionada.
   * @param mascotaId Mascota seleccionada.
   */
  private cargarConsultas(mascotaId: number | null): void {
    const consulta = this.form.get('historiaId')!;
    consulta.reset(null);
    this.consultasMascota = [];
    if (!mascotaId) {
      consulta.disable();
      return;
    }
    this.cargandoConsultas = true;
    this.historiaService.listarPorMascota(mascotaId).pipe(finalize(() => this.cargandoConsultas = false)).subscribe({
      next: (historias) => {
        this.consultasMascota = historias;
        consulta.enable({ emitEvent: false });
      },
      error: (error) => notificarError(error, 'No fue posible cargar las consultas de la mascota.')
    });
  }

  /** Abre el formulario para crear una fórmula. */
  nuevaFormula(): void {
    this.formulaEditada = null;
    this.form.reset({ fechaEmision: hoy(), unidadDosis: 'mg' });
    this.form.get('clienteId')!.enable({ emitEvent: false });
    this.abrirModal('modalFormularioFormula');
  }

  /**
   * Consulta la fórmula completa y abre el formulario de edición. La mascota
   * y la consulta asociada no se pueden cambiar.
   * @param resumen Fórmula seleccionada en la tabla.
   */
  editarFormula(resumen: FormulaMedicaResumen): void {
    this.formulaService.consultar(resumen.formulaId).subscribe({
      next: (formula) => {
        this.formulaEditada = formula;
        this.mascotasCliente = [formula.mascota];
        this.consultasMascota = [formula.historiaMedica];
        this.form.reset({
          clienteId: formula.mascota.cliente?.id,
          mascotaId: formula.mascota.mascotaId,
          historiaId: formula.historiaMedica.historiaId,
          medicoId: formula.medico.id,
          fechaEmision: formula.fechaEmision,
          medicamento: formula.medicamento,
          dosis: formula.dosis,
          unidadDosis: formula.unidadDosis,
          frecuenciaHoras: formula.frecuenciaHoras,
          duracionDias: formula.duracionDias,
          indicaciones: formula.indicaciones
        }, { emitEvent: false });
        this.form.get('clienteId')!.disable({ emitEvent: false });
        this.form.get('mascotaId')!.disable({ emitEvent: false });
        this.form.get('historiaId')!.disable({ emitEvent: false });
        this.abrirModal('modalFormularioFormula');
      },
      error: (error) => notificarError(error, 'No fue posible consultar la fórmula.')
    });
  }

  /** Envía la fórmula al backend (crear o editar). */
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valores = this.form.getRawValue();
    if (valores.fechaEmision < this.fechaMinimaEmision) {
      notificarAdvertencia('Fecha inválida', 'La fecha de emisión no puede ser anterior a la fecha de la consulta.');
      return;
    }
    const rq: FormulaMedicaRq = {
      clienteId: valores.clienteId,
      mascotaId: valores.mascotaId,
      historiaId: valores.historiaId,
      medicoId: valores.medicoId,
      fechaEmision: valores.fechaEmision,
      medicamento: valores.medicamento.trim(),
      dosis: Number(valores.dosis),
      unidadDosis: valores.unidadDosis,
      frecuenciaHoras: Number(valores.frecuenciaHoras),
      duracionDias: Number(valores.duracionDias),
      indicaciones: valores.indicaciones.trim()
    };
    const peticion: Observable<MiRespuestaRS> = this.formulaEditada
      ? this.formulaService.editar(this.formulaEditada.formulaId, rq)
      : this.formulaService.crear(rq);

    this.guardando = true;
    peticion.pipe(finalize(() => this.guardando = false)).subscribe({
      next: (respuesta) => {
        notificarExito(respuesta.message);
        this.cerrarModal('modalFormularioFormula');
        this.cargar();
      },
      error: (error) => notificarError(error, 'No fue posible guardar la fórmula.')
    });
  }

  /**
   * Consulta y muestra el detalle completo de la fórmula.
   * @param resumen Fórmula seleccionada en la tabla.
   */
  verDetalle(resumen: FormulaMedicaResumen): void {
    this.formulaDetalle = null;
    this.cargandoDetalle = true;
    this.abrirModal('modalDetalleFormula');
    this.formulaService.consultar(resumen.formulaId).pipe(finalize(() => this.cargandoDetalle = false)).subscribe({
      next: (formula) => this.formulaDetalle = formula,
      error: (error) => {
        this.cerrarModal('modalDetalleFormula');
        notificarError(error, 'No fue posible consultar la fórmula.');
      }
    });
  }

  /**
   * Inactiva una fórmula previa confirmación (no se elimina porque está
   * asociada a información clínica).
   * @param resumen Fórmula a inactivar.
   */
  async inactivar(resumen: FormulaMedicaResumen): Promise<void> {
    const aceptado = await confirmar('¿Inactivar fórmula?',
      `La fórmula de ${resumen.medicamento} para ${resumen.mascota} quedará inactiva y no se podrá editar. ` +
      'No se elimina porque hace parte de la historia clínica.', 'Sí, inactivar');
    if (!aceptado) {
      return;
    }
    this.formulaService.inactivar(resumen.formulaId).subscribe({
      next: (respuesta) => {
        notificarExito(respuesta.message);
        this.cargar();
      },
      error: (error) => notificarError(error, 'No fue posible inactivar la fórmula.')
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
