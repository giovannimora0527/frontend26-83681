import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ClienteMascotaSelectorComponent } from 'src/app/components/cliente-mascota-selector/cliente-mascota-selector.component';
import { Cita, CitaRq } from 'src/app/models/cita';
import { ESTADOS_CITA, ESTADOS_CITA_NUEVA, EstadoCita } from 'src/app/models/estados';
import { Medico } from 'src/app/models/medico';
import { NotificacionService } from 'src/app/services/notificacion.service';
import { aInputFechaHora, ahoraLocalInput, soloFecha, soloHora, unirFechaHora, hoyLocal } from 'src/app/utils/fecha.util';
import { mensajeDeError } from 'src/app/utils/api-error.util';
import { MedicosService } from '../../medicos/service/medicos.service';
import { CitaService } from '../service/cita.service';

/**
 * Formulario (modal) para crear o editar una cita.
 *
 * Restricciones de edición según el estado de la cita (el backend las valida también):
 * - CANCELADA: no se puede modificar; solo se reactiva con la operación explícita "Reactivar".
 *   Justificación: una cita cancelada ya liberó el horario del veterinario; editarla en silencio
 *   podría generar choques de agenda.
 * - ATENDIDA: solo se pueden editar las observaciones.
 *   Justificación: es información histórica que respalda la historia clínica.
 * - Resto de estados: se puede cambiar fecha, hora, veterinario, motivo y estado.
 */
@Component({
  selector: 'app-cita-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ClienteMascotaSelectorComponent],
  templateUrl: './cita-form.component.html'
})
export class CitaFormComponent implements OnInit {

  /** Cita a editar; si no se recibe, el formulario crea una nueva. */
  @Input() cita?: Cita;

  /** Formulario reactivo de la cita. */
  form!: FormGroup;
  /** Veterinarios disponibles. */
  medicos: Medico[] = [];
  /** Estados que se ofrecen en el combo. */
  estados: readonly EstadoCita[] = ESTADOS_CITA_NUEVA;
  /** Fecha mínima permitida en el calendario (hoy). */
  readonly hoy = hoyLocal();
  /** Mensaje de error mostrado en el modal. */
  mensajeError = '';
  /** Evita doble envío mientras se guarda. */
  guardando = false;
  /** Mensaje que explica por qué el formulario está restringido (si aplica). */
  aviso = '';

  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private citaService: CitaService,
    private medicosService: MedicosService,
    private notificacion: NotificacionService
  ) { }

  /** Construye el formulario, lo rellena si es edición y aplica las restricciones por estado. */
  ngOnInit(): void {
    this.form = this.fb.group({
      clienteId: [this.cita?.clienteId ?? null, Validators.required],
      mascotaId: [this.cita?.mascotaId ?? null, Validators.required],
      medicoId: [this.cita?.medicoId ?? null, Validators.required],
      fecha: [soloFecha(this.cita?.fechaHora) || '', Validators.required],
      hora: [soloHora(this.cita?.fechaHora) || '', Validators.required],
      motivo: [this.cita?.motivo ?? '', [Validators.required, Validators.maxLength(200)]],
      estado: [this.cita?.estado ?? 'PENDIENTE', Validators.required],
      observaciones: [this.cita?.observaciones ?? '', Validators.maxLength(255)]
    }, { validators: [this.validarFechaFutura.bind(this)] });

    if (this.cita) {
      this.estados = ESTADOS_CITA;
      this.aplicarRestriccionesPorEstado(this.cita.estado);
    }
    this.medicosService.listar().subscribe({
      next: (m) => (this.medicos = m),
      error: (err) => this.notificacion.error(mensajeDeError(err))
    });
  }

  /** True cuando el formulario edita una cita existente. */
  get esEdicion(): boolean {
    return !!this.cita;
  }

  /** True cuando la cita no admite ningún cambio (cancelada). */
  get soloLectura(): boolean {
    return this.cita?.estado === 'CANCELADA';
  }

  /**
   * Regla: no se registran citas en fechas anteriores a la actual.
   * En edición solo se exige cuando el usuario cambia la fecha u hora originales.
   */
  private validarFechaFutura(control: AbstractControl): ValidationErrors | null {
    const fecha = control.get('fecha')?.value;
    const hora = control.get('hora')?.value;
    if (!fecha || !hora) {
      return null;
    }
    const nueva = unirFechaHora(fecha, hora);
    if (this.cita && aInputFechaHora(this.cita.fechaHora) === nueva.substring(0, 16)) {
      return null;
    }
    return nueva.substring(0, 16) < ahoraLocalInput() ? { fechaPasada: true } : null;
  }

  /**
   * Deshabilita los campos que no se pueden modificar según el estado actual de la cita.
   * @param estado estado de la cita que se edita.
   */
  private aplicarRestriccionesPorEstado(estado: EstadoCita): void {
    if (estado === 'CANCELADA') {
      this.form.disable();
      this.aviso = 'Una cita cancelada no puede modificarse. Para volver a usarla debe reactivarla con la opción "Reactivar".';
    } else if (estado === 'ATENDIDA') {
      ['clienteId', 'mascotaId', 'medicoId', 'fecha', 'hora', 'motivo', 'estado'].forEach((c) => this.form.get(c)?.disable());
      this.aviso = 'Una cita atendida es parte del historial clínico: solo se pueden editar las observaciones.';
    }
  }

  /**
   * Indica si un control es inválido y ya fue tocado.
   * @param control nombre del control.
   */
  invalido(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  /** Valida el formulario y envía la cita al backend (crear o editar). */
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const cuerpo: CitaRq = {
      clienteId: v.clienteId,
      mascotaId: v.mascotaId,
      medicoId: v.medicoId,
      fechaHora: unirFechaHora(v.fecha, v.hora),
      motivo: v.motivo.trim(),
      estado: v.estado,
      observaciones: v.observaciones?.trim() || undefined
    };
    this.guardando = true;
    this.mensajeError = '';
    const peticion = this.cita ? this.citaService.editar(this.cita.id, cuerpo) : this.citaService.crear(cuerpo);
    peticion.subscribe({
      next: (r) => {
        this.guardando = false;
        this.notificacion.exito(r?.message || (this.cita ? 'Cita actualizada correctamente.' : 'Cita registrada correctamente.'));
        this.modal.close(true);
      },
      error: (err) => {
        this.guardando = false;
        this.mensajeError = mensajeDeError(err);
      }
    });
  }
}
