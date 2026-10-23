import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ClienteMascotaSelectorComponent } from 'src/app/components/cliente-mascota-selector/cliente-mascota-selector.component';
import { UNIDADES_DOSIS } from 'src/app/models/estados';
import { FormulaDetalle, FormulaRq } from 'src/app/models/formula-medica';
import { HistoriaMedica } from 'src/app/models/historia-medica';
import { Medicamento } from 'src/app/models/medicamento';
import { Medico } from 'src/app/models/medico';
import { NotificacionService } from 'src/app/services/notificacion.service';
import { aInputFechaHora, aLocalDateTime, ahoraLocalInput, formatearFechaHora } from 'src/app/utils/fecha.util';
import { mensajeDeError } from 'src/app/utils/api-error.util';
import { MedicosService } from '../../medicos/service/medicos.service';
import { MedicamentoService } from '../../medicamento/service/medicamento.service';
import { HistoriaMedicaService } from '../../historia-medica/service/historia-medica.service';
import { FormulaMedicaService } from '../service/formula-medica.service';

/**
 * Formulario (modal) para crear o editar una fórmula médica.
 * Combos dependientes: Cliente → Mascota del cliente → Historias clínicas de esa mascota.
 *
 * Al editar, el cliente, la mascota y la historia quedan bloqueados: cambiarlos reasignaría la
 * fórmula a otra consulta y podría dejar información incoherente (la fórmula pertenece a una consulta concreta).
 */
@Component({
  selector: 'app-formula-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ClienteMascotaSelectorComponent],
  templateUrl: './formula-form.component.html'
})
export class FormulaFormComponent implements OnInit {

  /** Fórmula a editar (detalle completo); si no se recibe, se crea una nueva. */
  @Input() formula?: FormulaDetalle;

  /** Formulario reactivo de la fórmula. */
  form!: FormGroup;
  /** Veterinarios disponibles. */
  medicos: Medico[] = [];
  /** Medicamentos disponibles. */
  medicamentos: Medicamento[] = [];
  /** Historias clínicas de la mascota seleccionada. */
  historias: HistoriaMedica[] = [];
  /** Unidades de dosis permitidas. */
  readonly unidades = UNIDADES_DOSIS;
  /** Mensaje de error mostrado en el modal. */
  mensajeError = '';
  /** Evita doble envío mientras se guarda. */
  guardando = false;

  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private formulaService: FormulaMedicaService,
    private historiaService: HistoriaMedicaService,
    private medicosService: MedicosService,
    private medicamentoService: MedicamentoService,
    private notificacion: NotificacionService
  ) { }

  /** Construye el formulario, carga los catálogos y enlaza los combos dependientes. */
  ngOnInit(): void {
    const f = this.formula;
    this.form = this.fb.group({
      clienteId: [f?.clienteId ?? null, Validators.required],
      mascotaId: [f?.mascotaId ?? null, Validators.required],
      historiaId: [f?.historiaId ?? null, Validators.required],
      medicoId: [f?.medicoId ?? null, Validators.required],
      fechaEmision: [f ? aInputFechaHora(f.fechaEmision) : ahoraLocalInput(), Validators.required],
      medicamentoId: [f?.medicamentoId ?? null, Validators.required],
      dosis: [f?.dosis ?? null, [Validators.required, Validators.min(0.01), Validators.max(10000)]],
      unidadDosis: [f?.unidadDosis ?? 'mg', Validators.required],
      frecuenciaHoras: [f?.frecuenciaHoras ?? null, [Validators.required, Validators.min(1), Validators.max(72), Validators.pattern(/^\d+$/)]],
      duracionDias: [f?.duracionDias ?? null, [Validators.required, Validators.min(1), Validators.max(365), Validators.pattern(/^\d+$/)]],
      indicaciones: [f?.indicaciones ?? '', [Validators.required, Validators.maxLength(500)]]
    }, { validators: [this.validarFechaEmision.bind(this)] });

    this.medicosService.listar().subscribe({ next: (m) => (this.medicos = m), error: (e) => this.notificacion.error(mensajeDeError(e)) });
    this.medicamentoService.listar().subscribe({ next: (m) => (this.medicamentos = m), error: (e) => this.notificacion.error(mensajeDeError(e)) });

    if (f) {
      // En edición la fórmula no puede cambiar de cliente, mascota ni historia.
      ['clienteId', 'mascotaId', 'historiaId'].forEach((c) => this.form.get(c)?.disable());
      this.cargarHistorias(f.mascotaId, false);
    } else {
      this.form.get('mascotaId')?.valueChanges.subscribe((mascotaId) => this.cargarHistorias(mascotaId, true));
    }
  }

  /** True cuando el formulario edita una fórmula existente. */
  get esEdicion(): boolean {
    return !!this.formula;
  }

  /** Historia clínica seleccionada (o undefined). */
  get historiaSeleccionada(): HistoriaMedica | undefined {
    const id = this.form.get('historiaId')?.value;
    return this.historias.find((h) => h.id === id);
  }

  /** Fecha de la consulta asociada, con formato legible (para el mensaje de validación). */
  get fechaConsultaTexto(): string {
    const fecha = this.historiaSeleccionada?.fechaHora ?? this.formula?.fechaConsulta;
    return formatearFechaHora(fecha);
  }

  /**
   * Regla: la fecha de emisión no puede ser anterior a la fecha de la consulta asociada.
   * Usa solo el control recibido (el validador corre mientras se construye el formulario).
   */
  private validarFechaEmision(control: AbstractControl): ValidationErrors | null {
    const historiaId = control.get('historiaId')?.value;
    const fechaConsulta = this.historias.find((h) => h.id === historiaId)?.fechaHora ?? this.formula?.fechaConsulta;
    const emision = control.get('fechaEmision')?.value;
    if (!fechaConsulta || !emision) {
      return null;
    }
    return emision < aInputFechaHora(fechaConsulta) ? { emisionAnteriorConsulta: true } : null;
  }

  /**
   * Consulta las historias clínicas de la mascota.
   * @param mascotaId mascota seleccionada (null si se limpió).
   * @param reiniciar true para limpiar la historia elegida (cuando el usuario cambia de mascota).
   */
  private cargarHistorias(mascotaId: number | null, reiniciar: boolean): void {
    this.historias = [];
    if (reiniciar) {
      this.form.get('historiaId')?.setValue(null);
    }
    if (!mascotaId) {
      return;
    }
    this.historiaService.listarPorMascota(mascotaId).subscribe({
      next: (h) => { this.historias = h; this.form.updateValueAndValidity(); },
      error: (err) => this.notificacion.error(mensajeDeError(err))
    });
  }

  /** Al elegir la historia se precarga el veterinario y se revalida la fecha de emisión. */
  alSeleccionarHistoria(): void {
    const historia = this.historiaSeleccionada;
    if (historia && !this.form.get('medicoId')?.value) {
      this.form.get('medicoId')?.setValue(historia.medicoId);
    }
    this.form.updateValueAndValidity();
  }

  /**
   * Texto que describe una historia en el combo.
   * @param historia historia clínica.
   */
  etiquetaHistoria(historia: HistoriaMedica): string {
    return `${formatearFechaHora(historia.fechaHora)} - ${historia.motivoConsulta}`;
  }

  /**
   * Indica si un control es inválido y ya fue tocado.
   * @param control nombre del control.
   */
  invalido(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  /** Valida y envía la fórmula al backend (crear o editar). */
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const cuerpo: FormulaRq = {
      clienteId: v.clienteId,
      mascotaId: v.mascotaId,
      historiaId: v.historiaId,
      medicoId: v.medicoId,
      fechaEmision: aLocalDateTime(v.fechaEmision),
      medicamentoId: v.medicamentoId,
      dosis: Number(v.dosis),
      unidadDosis: v.unidadDosis,
      frecuenciaHoras: Number(v.frecuenciaHoras),
      duracionDias: Number(v.duracionDias),
      indicaciones: v.indicaciones.trim()
    };
    this.guardando = true;
    this.mensajeError = '';
    const peticion = this.formula ? this.formulaService.editar(this.formula.id, cuerpo) : this.formulaService.crear(cuerpo);
    peticion.subscribe({
      next: (r) => {
        this.guardando = false;
        this.notificacion.exito(r?.message || (this.formula ? 'Fórmula actualizada correctamente.' : 'Fórmula registrada correctamente.'));
        this.modal.close(true);
      },
      error: (err) => {
        this.guardando = false;
        this.mensajeError = mensajeDeError(err);
      }
    });
  }
}
