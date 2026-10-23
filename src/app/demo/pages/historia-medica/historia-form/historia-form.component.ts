import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ClienteMascotaSelectorComponent } from 'src/app/components/cliente-mascota-selector/cliente-mascota-selector.component';
import { Cita } from 'src/app/models/cita';
import { ESTADOS_HISTORIA } from 'src/app/models/estados';
import { HistoriaMedicaRq } from 'src/app/models/historia-medica';
import { Medico } from 'src/app/models/medico';
import { NotificacionService } from 'src/app/services/notificacion.service';
import { aInputFechaHora, aLocalDateTime, ahoraLocalInput, formatearFechaHora } from 'src/app/utils/fecha.util';
import { mensajeDeError } from 'src/app/utils/api-error.util';
import { CitaService } from '../../cita/service/cita.service';
import { MedicosService } from '../../medicos/service/medicos.service';
import { HistoriaMedicaService } from '../service/historia-medica.service';

/**
 * Formulario (modal) para registrar una historia clínica.
 * Flujo de combos dependientes: Cliente → Mascota del cliente → Citas ATENDIDAS de esa mascota.
 * Al elegir la cita se precargan veterinario, fecha y motivo.
 */
@Component({
  selector: 'app-historia-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ClienteMascotaSelectorComponent],
  templateUrl: './historia-form.component.html'
})
export class HistoriaFormComponent implements OnInit {

  /** Formulario reactivo de la historia. */
  form!: FormGroup;
  /** Veterinarios disponibles. */
  medicos: Medico[] = [];
  /** Citas atendidas de la mascota seleccionada. */
  citas: Cita[] = [];
  /** Estados posibles de la historia. */
  readonly estados = ESTADOS_HISTORIA;
  /** Mensaje de error mostrado en el modal. */
  mensajeError = '';
  /** Evita doble envío mientras se guarda. */
  guardando = false;

  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private historiaService: HistoriaMedicaService,
    private citaService: CitaService,
    private medicosService: MedicosService,
    private notificacion: NotificacionService
  ) { }

  /** Construye el formulario y enlaza los combos dependientes. */
  ngOnInit(): void {
    this.form = this.fb.group({
      clienteId: [null, Validators.required],
      mascotaId: [null, Validators.required],
      citaId: [null, Validators.required],
      medicoId: [null, Validators.required],
      fechaHora: [ahoraLocalInput(), Validators.required],
      motivoConsulta: ['', [Validators.required, Validators.maxLength(200)]],
      diagnostico: ['', [Validators.required, Validators.maxLength(500)]],
      observaciones: ['', Validators.maxLength(500)],
      estado: ['ABIERTA', Validators.required]
    }, { validators: [this.validarFechaConsulta.bind(this)] });

    this.medicosService.listar().subscribe({
      next: (m) => (this.medicos = m),
      error: (err) => this.notificacion.error(mensajeDeError(err))
    });

    // Cuando cambia la mascota se cargan sus citas atendidas.
    this.form.get('mascotaId')?.valueChanges.subscribe((mascotaId) => this.cargarCitas(mascotaId));
  }

  /** Cita actualmente seleccionada (o undefined). */
  get citaSeleccionada(): Cita | undefined {
    return this.citas.find((c) => c.id === this.form.get('citaId')?.value);
  }

  /** Regla: la fecha de la consulta no puede ser anterior a la fecha de la cita asociada. */
  private validarFechaConsulta(control: AbstractControl): ValidationErrors | null {
    const cita = this.citas.find((c) => c.id === control.get('citaId')?.value);
    const fecha = control.get('fechaHora')?.value;
    if (!cita || !fecha) {
      return null;
    }
    return fecha < aInputFechaHora(cita.fechaHora) ? { fechaAnteriorCita: true } : null;
  }

  /**
   * Consulta las citas de la mascota y deja solo las atendidas (únicas que pueden generar historia).
   * @param mascotaId mascota seleccionada (null si se limpió).
   */
  private cargarCitas(mascotaId: number | null): void {
    this.citas = [];
    this.form.get('citaId')?.setValue(null);
    if (!mascotaId) {
      return;
    }
    this.citaService.listarPorMascota(mascotaId).subscribe({
      next: (c) => (this.citas = c.filter((x) => x.estado === 'ATENDIDA')),
      error: (err) => this.notificacion.error(mensajeDeError(err))
    });
  }

  /** Al elegir una cita se precargan el veterinario, la fecha y el motivo de la consulta. */
  alSeleccionarCita(): void {
    const cita = this.citaSeleccionada;
    if (!cita) {
      return;
    }
    this.form.patchValue({
      medicoId: cita.medicoId,
      fechaHora: aInputFechaHora(cita.fechaHora),
      motivoConsulta: this.form.get('motivoConsulta')?.value || cita.motivo
    });
  }

  /**
   * Texto que describe una cita en el combo.
   * @param cita cita atendida.
   */
  etiquetaCita(cita: Cita): string {
    return `${formatearFechaHora(cita.fechaHora)} - ${cita.motivo}`;
  }

  /**
   * Indica si un control es inválido y ya fue tocado.
   * @param control nombre del control.
   */
  invalido(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  /** Valida y envía la historia clínica al backend. */
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const cuerpo: HistoriaMedicaRq = {
      clienteId: v.clienteId,
      mascotaId: v.mascotaId,
      citaId: v.citaId,
      medicoId: v.medicoId,
      fechaHora: aLocalDateTime(v.fechaHora),
      motivoConsulta: v.motivoConsulta.trim(),
      diagnostico: v.diagnostico.trim(),
      observaciones: v.observaciones?.trim() || undefined,
      estado: v.estado
    };
    this.guardando = true;
    this.mensajeError = '';
    this.historiaService.crear(cuerpo).subscribe({
      next: (r) => {
        this.guardando = false;
        this.notificacion.exito(r?.message || 'Historia clínica registrada correctamente.');
        this.modal.close(true);
      },
      error: (err) => {
        this.guardando = false;
        this.mensajeError = mensajeDeError(err);
      }
    });
  }
}
