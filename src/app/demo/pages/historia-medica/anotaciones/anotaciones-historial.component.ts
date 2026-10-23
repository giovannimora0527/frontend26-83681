import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, finalize } from 'rxjs';

import { AnotacionHistoriaService } from '../service/anotacion-historia.service';
import { AnotacionHistoria } from 'src/app/models/anotacion-historia';
import { HistoriaMedica } from 'src/app/models/historia-medica';
import { Medico } from 'src/app/models/medico';
import { PaginaRs } from 'src/app/models/pagina';
import { AnotacionHistoriaRq } from 'src/app/models/requests';
import { TablaPaginada } from 'src/app/shared/tabla-paginada';
import { PaginacionComponent } from 'src/app/shared/components/paginacion/paginacion.component';
import { ColumnaOrdenableComponent } from 'src/app/shared/components/columna-ordenable/columna-ordenable.component';
import { CargandoComponent } from 'src/app/shared/components/cargando/cargando.component';
import { aFechaHoraBackend, aInputFechaHora, ahora } from 'src/app/utils/fecha.util';
import { notificarAdvertencia, notificarError, notificarExito } from 'src/app/utils/notificacion.util';
import { fechaHoraNoFutura, noSoloEspacios } from 'src/app/utils/validadores';

/** Alcance del histórico: solo la consulta abierta o todas las consultas de la mascota. */
type AlcanceHistorial = 'historia' | 'mascota';

/**
 * Histórico de anotaciones que se muestra dentro del detalle de una historia
 * clínica. Es un DataTable con filtros, orden por fecha, paginación y
 * consulta del detalle de cada anotación; además permite agregar anotaciones
 * mientras la historia esté abierta.
 */
@Component({
  selector: 'app-anotaciones-historial',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PaginacionComponent, ColumnaOrdenableComponent,
    CargandoComponent],
  templateUrl: './anotaciones-historial.component.html'
})
export class AnotacionesHistorialComponent extends TablaPaginada<AnotacionHistoria> implements OnChanges {
  /** Historia clínica cuyo histórico se muestra. */
  @Input({ required: true }) historia!: HistoriaMedica;
  /** Veterinarios disponibles para el formulario. */
  @Input() medicos: Medico[] = [];

  /** Alcance seleccionado del histórico. */
  alcance: AlcanceHistorial = 'historia';
  // Filtros.
  filtroTexto = '';
  filtroDesde = '';
  filtroHasta = '';

  /** Anotación cuyo detalle se está viendo. */
  anotacionSeleccionada: AnotacionHistoria | null = null;
  /** Indica si el formulario de nueva anotación está visible. */
  mostrarFormulario = false;
  /** Formulario de nueva anotación. */
  form: FormGroup;
  /** Indica si se está guardando la anotación. */
  guardando = false;

  protected readonly mensajeErrorConsulta = 'No fue posible consultar las anotaciones.';

  constructor(
    private readonly anotacionService: AnotacionHistoriaService,
    private readonly formBuilder: FormBuilder
  ) {
    super({ columna: 'fecha', direccion: 'desc' });
    this.form = this.formBuilder.group({
      fechaAnotacion: ['', [Validators.required, fechaHoraNoFutura]],
      medicoId: [null, Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(2000), noSoloEspacios]],
      observacion: ['', [Validators.required, Validators.maxLength(2000), noSoloEspacios]],
      diagnosticoEvolucion: ['', [Validators.required, Validators.maxLength(2000), noSoloEspacios]]
    });
  }

  /**
   * Cuando cambia la historia mostrada, reinicia filtros y vuelve a consultar.
   * @param cambios Cambios de los inputs.
   */
  ngOnChanges(cambios: SimpleChanges): void {
    if (cambios['historia'] && this.historia) {
      this.alcance = 'historia';
      this.anotacionSeleccionada = null;
      this.mostrarFormulario = false;
      this.limpiarFiltros();
    }
  }

  /** Acceso corto a los controles del formulario. */
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  /** Fecha mínima permitida para una anotación (la fecha de la consulta). */
  get fechaMinima(): string {
    return aInputFechaHora(this.historia.fechaConsulta);
  }

  /** Fecha máxima permitida (ahora). */
  get fechaMaxima(): string {
    return ahora();
  }

  /** {@inheritDoc} */
  protected consultar(params: HttpParams): Observable<PaginaRs<AnotacionHistoria>> {
    return this.alcance === 'mascota'
      ? this.anotacionService.listarPorMascota(this.historia.mascota.mascotaId!, params)
      : this.anotacionService.listarPorHistoria(this.historia.historiaId, params);
  }

  /** {@inheritDoc} */
  protected filtros(): Record<string, unknown> {
    return { texto: this.filtroTexto, fechaDesde: this.filtroDesde, fechaHasta: this.filtroHasta };
  }

  /**
   * Cambia entre ver solo esta consulta o todo el historial de la mascota.
   * @param alcance Alcance seleccionado.
   */
  cambiarAlcance(alcance: AlcanceHistorial): void {
    this.alcance = alcance;
    this.anotacionSeleccionada = null;
    this.buscar();
  }

  /** Quita los filtros y vuelve al orden por fecha descendente. */
  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroDesde = '';
    this.filtroHasta = '';
    this.restablecerOrden();
    this.buscar();
  }

  /**
   * Muestra (o cierra) el detalle de una anotación.
   * @param anotacion Anotación seleccionada.
   */
  verDetalle(anotacion: AnotacionHistoria): void {
    this.anotacionSeleccionada = this.anotacionSeleccionada?.anotacionId === anotacion.anotacionId ? null : anotacion;
  }

  /** Muestra el formulario de nueva anotación con valores sugeridos. */
  abrirFormulario(): void {
    this.form.reset({ fechaAnotacion: ahora(), medicoId: this.historia.medico.id });
    this.mostrarFormulario = true;
  }

  /** Envía la nueva anotación al backend. */
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valores = this.form.value;
    if (valores.fechaAnotacion < this.fechaMinima) {
      notificarAdvertencia('Fecha inválida', 'La fecha de la anotación no puede ser anterior a la fecha de la consulta.');
      return;
    }
    const rq: AnotacionHistoriaRq = {
      historiaId: this.historia.historiaId,
      medicoId: valores.medicoId,
      fechaAnotacion: aFechaHoraBackend(valores.fechaAnotacion),
      descripcion: valores.descripcion.trim(),
      observacion: valores.observacion.trim(),
      diagnosticoEvolucion: valores.diagnosticoEvolucion.trim()
    };
    this.guardando = true;
    this.anotacionService.crear(rq).pipe(finalize(() => this.guardando = false)).subscribe({
      next: (respuesta) => {
        notificarExito(respuesta.message);
        this.mostrarFormulario = false;
        this.buscar();
      },
      error: (error) => notificarError(error, 'No fue posible guardar la anotación.')
    });
  }
}
