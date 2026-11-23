import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Modal } from 'bootstrap';
import Swal from 'sweetalert2';

import { Cita } from 'src/app/models/cita';
import { HistoriaMedica } from 'src/app/models/historia-medica';
import { Mascota } from 'src/app/models/mascota';
import { Medico } from 'src/app/models/medico';
import { descargarArchivo, mensajeError } from 'src/app/utils/archivo.util';
import { CitaService, HorarioMedico } from '../cita/service/cita.service';
import { HistoriaService } from '../historia/service/historia.service';
import { MascotaService } from '../mascota/service/mascota.service';
import { MedicoService } from '../medico/service/medico.service';
import { ReportesService } from '../reportes/service/reportes.service';

type Vista = 'mes' | 'semana' | 'dia';

interface DiaCalendario {
  fecha: Date;
  delMes: boolean;
  hoy: boolean;
  citas: Cita[];
}

const MEDICO_KEY = 'agenda.medicoId';
const HORA_INICIO = 6;
const HORA_FIN = 21;
const PX_HORA = 56;

/**
 * Requerimiento 2: agenda del médico veterinario en vista de calendario (día, semana y mes).
 * Toda la información se lee y escribe contra el backend (/cita/*), no es estado temporal de la interfaz.
 */
@Component({
  selector: 'app-agenda',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss'
})
export class AgendaComponent implements OnInit {
  readonly estados = ['PROGRAMADA', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA'];
  readonly diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  readonly nombresDia = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  readonly horas = Array.from({ length: HORA_FIN - HORA_INICIO }, (_, i) => HORA_INICIO + i);
  readonly pxHora = PX_HORA;

  vista: Vista = 'semana';
  fechaRef = this.inicioDia(new Date());
  medicos: Medico[] = [];
  medicoId: number | null = null;
  mascotas: Mascota[] = [];
  citas: Cita[] = [];
  filtroEstado = '';
  cargando = false;
  error = '';

  // Detalle, formulario y atención
  citaSel: Cita | null = null;
  formCita!: FormGroup;
  formAtencion!: FormGroup;
  formHorario!: FormGroup;
  formReporte!: FormGroup;
  slots: string[] = [];
  cargandoSlots = false;
  enviando = false;
  historialMascota: Cita[] = [];
  antecedentes: HistoriaMedica | null = null;
  horarios: HorarioMedico[] = [];

  private modales: Record<string, Modal> = {};

  constructor(
    private readonly citaService: CitaService,
    private readonly medicoService: MedicoService,
    private readonly mascotaService: MascotaService,
    private readonly historiaService: HistoriaService,
    private readonly reportesService: ReportesService,
    private readonly fb: FormBuilder,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const hoy = this.fechaIso(new Date());
    this.formCita = this.fb.group({
      id: [null],
      mascota: [null, Validators.required],
      fecha: [hoy, Validators.required],
      hora: [null, Validators.required],
      duracionMinutos: [30, [Validators.required, Validators.min(10), Validators.max(240)]],
      motivo: ['', [Validators.required, Validators.maxLength(500)]],
      estado: ['PROGRAMADA']
    });
    this.formAtencion = this.fb.group({
      motivo: ['', Validators.required],
      sintomas: ['', Validators.required],
      diagnostico: ['', Validators.required],
      observaciones: ['', Validators.required],
      recomendaciones: ['']
    });
    this.formHorario = this.fb.group({
      diaSemana: [1, Validators.required],
      horaInicio: ['08:00', Validators.required],
      horaFin: ['17:00', Validators.required]
    });
    this.formReporte = this.fb.group({
      desde: [this.fechaIso(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), Validators.required],
      hasta: [hoy, Validators.required]
    });
    this.formCita.get('fecha')?.valueChanges.subscribe(() => this.cargarSlots());
    this.formCita.get('duracionMinutos')?.valueChanges.subscribe(() => this.cargarSlots());

    this.medicoService.listar().subscribe({
      next: medicos => {
        this.medicos = medicos.filter(m => m.estado !== false);
        const guardado = Number(this.leerPreferencia());
        this.medicoId = this.medicos.some(m => m.id === guardado) ? guardado : this.medicos[0]?.id ?? null;
        this.cargarCitas();
      },
      error: err => this.error = mensajeError(err, 'No fue posible cargar los médicos.')
    });
    this.mascotaService.listarMascotas().subscribe({
      next: mascotas => this.mascotas = mascotas.filter(m => m.activo !== false),
      error: err => console.error('No fue posible cargar las mascotas', err)
    });
  }

  // ---------- Navegación del calendario ----------

  get medico(): Medico | undefined {
    return this.medicos.find(m => m.id === this.medicoId);
  }

  cambiarMedico(id: string): void {
    this.medicoId = Number(id) || null;
    try { localStorage.setItem(MEDICO_KEY, String(this.medicoId ?? '')); } catch { /* sin almacenamiento */ }
    this.cargarCitas();
  }

  cambiarVista(vista: Vista): void {
    this.vista = vista;
    this.cargarCitas();
  }

  mover(paso: number): void {
    const f = new Date(this.fechaRef);
    if (this.vista === 'mes') f.setMonth(f.getMonth() + paso, 1);
    else f.setDate(f.getDate() + paso * (this.vista === 'semana' ? 7 : 1));
    this.fechaRef = f;
    this.cargarCitas();
  }

  irHoy(): void {
    this.fechaRef = this.inicioDia(new Date());
    this.cargarCitas();
  }

  irADia(fecha: Date): void {
    this.fechaRef = this.inicioDia(fecha);
    this.vista = 'dia';
    this.cargarCitas();
  }

  get rango(): { inicio: Date; fin: Date } {
    const ref = this.fechaRef;
    if (this.vista === 'dia') {
      return { inicio: ref, fin: this.sumarDias(ref, 1) };
    }
    if (this.vista === 'semana') {
      const inicio = this.lunesDe(ref);
      return { inicio, fin: this.sumarDias(inicio, 7) };
    }
    const primero = new Date(ref.getFullYear(), ref.getMonth(), 1);
    const inicio = this.lunesDe(primero);
    const ultimo = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
    const fin = this.sumarDias(this.lunesDe(ultimo), 7);
    return { inicio, fin };
  }

  get titulo(): string {
    const { inicio, fin } = this.rango;
    const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString('es-CO', o);
    if (this.vista === 'mes') return fmt(this.fechaRef, { month: 'long', year: 'numeric' });
    if (this.vista === 'dia') return fmt(this.fechaRef, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return `${fmt(inicio, { day: 'numeric', month: 'short' })} – ${fmt(this.sumarDias(fin, -1), { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }

  cargarCitas(): void {
    if (!this.medicoId) { this.citas = []; return; }
    const { inicio, fin } = this.rango;
    this.cargando = true;
    this.error = '';
    this.citaService.listarCitasRango(this.fechaHoraIso(inicio), this.fechaHoraIso(new Date(fin.getTime() - 1000))).subscribe({
      next: citas => {
        this.citas = citas.filter(c => c.medico?.id === this.medicoId);
        this.cargando = false;
      },
      error: err => {
        this.citas = [];
        this.cargando = false;
        this.error = mensajeError(err, 'No fue posible cargar las citas.');
      }
    });
  }

  get citasVisibles(): Cita[] {
    return this.filtroEstado ? this.citas.filter(c => this.estado(c) === this.filtroEstado) : this.citas;
  }

  contar(estado: string): number {
    return this.citas.filter(c => this.estado(c) === estado).length;
  }

  get diasMes(): DiaCalendario[] {
    const { inicio, fin } = this.rango;
    const dias: DiaCalendario[] = [];
    for (let d = inicio; d < fin; d = this.sumarDias(d, 1)) {
      dias.push({
        fecha: d,
        delMes: d.getMonth() === this.fechaRef.getMonth(),
        hoy: this.mismoDia(d, new Date()),
        citas: this.citasDe(d)
      });
    }
    return dias;
  }

  get diasColumnas(): DiaCalendario[] {
    const { inicio } = this.rango;
    const total = this.vista === 'dia' ? 1 : 7;
    return Array.from({ length: total }, (_, i) => {
      const fecha = this.sumarDias(inicio, i);
      return { fecha, delMes: true, hoy: this.mismoDia(fecha, new Date()), citas: this.citasDe(fecha) };
    });
  }

  citasDe(dia: Date): Cita[] {
    return this.citasVisibles
      .filter(c => this.mismoDia(this.inicioCita(c), dia))
      .sort((a, b) => this.inicioCita(a).getTime() - this.inicioCita(b).getTime());
  }

  posicion(cita: Cita): { top: string; height: string } {
    const inicio = this.inicioCita(cita);
    const minutos = (inicio.getHours() - HORA_INICIO) * 60 + inicio.getMinutes();
    const duracion = cita.duracionMinutos ?? 30;
    return {
      top: `${Math.max(0, (minutos / 60) * PX_HORA)}px`,
      height: `${Math.max(22, (duracion / 60) * PX_HORA - 2)}px`
    };
  }

  // ---------- Detalle de la cita ----------

  verCita(cita: Cita, evento?: Event): void {
    evento?.stopPropagation();
    this.citaSel = cita;
    this.abrir('modalDetalleCita');
  }

  inicioCita(cita: Cita): Date {
    return new Date(cita.fechaHora);
  }

  finCita(cita: Cita): Date {
    return new Date(this.inicioCita(cita).getTime() + (cita.duracionMinutos ?? 30) * 60000);
  }

  estado(cita: Cita): string {
    return (cita.estado ?? 'PROGRAMADA').toUpperCase();
  }

  esEditable(cita: Cita): boolean {
    return !['ATENDIDA', 'CANCELADA'].includes(this.estado(cita));
  }

  puedeAtender(cita: Cita): boolean {
    return this.esEditable(cita);
  }

  // ---------- Crear / editar / reprogramar ----------

  nuevaCita(fecha?: Date, hora?: number): void {
    const base = fecha ?? this.fechaRef;
    this.citaSel = null;
    this.formCita.reset({
      id: null,
      mascota: null,
      fecha: this.fechaIso(base),
      hora: hora !== undefined ? this.fechaHoraIso(new Date(base.getFullYear(), base.getMonth(), base.getDate(), hora)) : null,
      duracionMinutos: 30,
      motivo: '',
      estado: 'PROGRAMADA'
    }, { emitEvent: false });
    this.cargarSlots();
    this.abrir('modalCita');
  }

  editarCita(cita: Cita): void {
    this.cerrar('modalDetalleCita');
    this.citaSel = cita;
    const inicio = this.inicioCita(cita);
    this.formCita.reset({
      id: cita.id,
      mascota: this.mascotas.find(m => m.mascotaId === cita.mascota?.mascotaId) ?? cita.mascota ?? null,
      fecha: this.fechaIso(inicio),
      hora: this.fechaHoraIso(inicio),
      duracionMinutos: cita.duracionMinutos ?? 30,
      motivo: cita.motivo ?? '',
      estado: this.estado(cita)
    }, { emitEvent: false });
    this.cargarSlots();
    this.abrir('modalCita');
  }

  compararMascotas(a: Mascota | null, b: Mascota | null): boolean {
    return a === b || (!!a && !!b && a.mascotaId === b.mascotaId);
  }

  /** Consulta al backend las franjas libres del médico (respeta horario semanal y cruces). */
  cargarSlots(): void {
    const fecha = this.formCita.get('fecha')?.value as string;
    const duracion = Number(this.formCita.get('duracionMinutos')?.value);
    if (!this.medicoId || !fecha || !duracion) { this.slots = []; return; }
    this.cargandoSlots = true;
    this.citaService.consultarDisponibilidad(this.medicoId, fecha, duracion).subscribe({
      next: disp => {
        const actual = this.formCita.get('hora')?.value as string | null;
        const libres = (disp.horariosDisponibles ?? []).map(h => h.slice(0, 19));
        // En edición, la hora original de la cita también es válida.
        this.slots = actual && actual.startsWith(fecha) && !libres.includes(actual) && this.formCita.get('id')?.value
          ? [actual, ...libres].sort()
          : libres;
        if (actual && !this.slots.includes(actual)) this.formCita.get('hora')?.setValue(null);
        this.cargandoSlots = false;
      },
      error: err => {
        this.slots = [];
        this.cargandoSlots = false;
        this.error = mensajeError(err, 'No fue posible consultar la disponibilidad.');
      }
    });
  }

  horaSlot(slot: string): string {
    return slot.slice(11, 16);
  }

  guardarCita(): void {
    if (this.formCita.invalid || !this.medicoId || this.enviando) {
      this.formCita.markAllAsTouched();
      return;
    }
    const v = this.formCita.getRawValue();
    const request = {
      id: v.id ?? undefined,
      mascotaId: (v.mascota as Mascota).mascotaId!,
      medicoId: this.medicoId,
      fechaHora: v.hora as string,
      motivo: (v.motivo as string).trim(),
      estado: v.id ? v.estado : 'PROGRAMADA',
      duracionMinutos: Number(v.duracionMinutos)
    };
    this.enviando = true;
    (v.id ? this.citaService.actualizarCita(request) : this.citaService.guardarCita(request)).subscribe({
      next: () => {
        this.enviando = false;
        this.cerrar('modalCita');
        Swal.fire('Listo', v.id ? 'La cita fue actualizada.' : 'La cita fue registrada.', 'success');
        this.cargarCitas();
      },
      error: err => {
        this.enviando = false;
        Swal.fire('No se pudo guardar', mensajeError(err), 'error');
      }
    });
  }

  /** Cambia el estado conservando la cita (las canceladas no se eliminan, conservan su historial). */
  cambiarEstado(cita: Cita, estado: 'CONFIRMADA' | 'CANCELADA'): void {
    const confirmar = estado === 'CANCELADA'
      ? Swal.fire({ title: '¿Cancelar la cita?', text: 'La cita se conservará en el historial como cancelada.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, cancelar', cancelButtonText: 'Volver' })
      : Promise.resolve({ isConfirmed: true });
    confirmar.then(r => {
      if (!r.isConfirmed) return;
      this.citaService.actualizarCita({
        id: cita.id,
        mascotaId: cita.mascota!.mascotaId!,
        medicoId: cita.medico!.id,
        fechaHora: this.fechaHoraIso(this.inicioCita(cita)),
        motivo: cita.motivo ?? '',
        estado,
        duracionMinutos: cita.duracionMinutos ?? 30
      }).subscribe({
        next: () => {
          this.cerrar('modalDetalleCita');
          Swal.fire('Listo', `La cita quedó ${estado.toLowerCase()}.`, 'success');
          this.cargarCitas();
        },
        error: err => Swal.fire('No se pudo actualizar', mensajeError(err), 'error')
      });
    });
  }

  // ---------- Atención médica (Req. 3.2) ----------

  atender(cita: Cita): void {
    this.cerrar('modalDetalleCita');
    this.citaSel = cita;
    this.formAtencion.reset({ motivo: cita.motivo ?? '', sintomas: '', diagnostico: '', observaciones: '', recomendaciones: '' });
    this.antecedentes = null;
    this.historiaService.listar().subscribe({
      next: historias => this.antecedentes = historias.find(h => h.historia?.mascota?.mascotaId === cita.mascota?.mascotaId) ?? null,
      error: () => this.antecedentes = null
    });
    this.cargarHistorial(cita);
    this.abrir('modalAtencion');
  }

  finalizarAtencion(): void {
    const cita = this.citaSel;
    if (!cita?.id || this.formAtencion.invalid || this.enviando) {
      this.formAtencion.markAllAsTouched();
      return;
    }
    const v = this.formAtencion.getRawValue();
    const observaciones = v.recomendaciones?.trim()
      ? `${v.observaciones.trim()}\nRecomendaciones: ${v.recomendaciones.trim()}`
      : v.observaciones.trim();
    this.enviando = true;
    this.citaService.cerrarConsulta(cita.id, {
      medicoId: cita.medico!.id,
      descripcion: `Motivo de consulta: ${v.motivo.trim()}\nSíntomas: ${v.sintomas.trim()}`,
      diagnostico: v.diagnostico.trim(),
      observaciones
    }).subscribe({
      next: () => {
        this.enviando = false;
        this.cerrar('modalAtencion');
        this.cargarCitas();
        Swal.fire({
          title: 'Atención finalizada',
          text: 'La anotación quedó en la historia clínica y la cita se marcó como ATENDIDA. ¿Deseas formular medicamentos?',
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'Ir a fórmulas médicas',
          cancelButtonText: 'Más tarde'
        }).then(r => { if (r.isConfirmed) this.router.navigate(['/inicio/formulas']); });
      },
      error: err => {
        this.enviando = false;
        Swal.fire('No se pudo finalizar', mensajeError(err), 'error');
      }
    });
  }

  // ---------- Historial de la mascota ----------

  verHistorial(cita: Cita): void {
    this.cerrar('modalDetalleCita');
    this.citaSel = cita;
    this.cargarHistorial(cita);
    this.abrir('modalHistorial');
  }

  private cargarHistorial(cita: Cita): void {
    this.historialMascota = [];
    const id = cita.mascota?.mascotaId;
    if (!id) return;
    this.citaService.listarCitasPorMascota(id).subscribe({
      next: citas => this.historialMascota = [...citas].sort((a, b) => this.inicioCita(b).getTime() - this.inicioCita(a).getTime()),
      error: err => console.error('No fue posible cargar el historial', err)
    });
  }

  // ---------- Horario de disponibilidad ----------

  abrirHorarios(): void {
    if (!this.medicoId) return;
    this.citaService.listarHorarios(this.medicoId).subscribe({
      next: h => this.horarios = [...h].sort((a, b) => a.diaSemana - b.diaSemana || a.horaInicio.localeCompare(b.horaInicio)),
      error: err => Swal.fire('Error', mensajeError(err), 'error')
    });
    this.abrir('modalHorarios');
  }

  guardarHorario(): void {
    if (!this.medicoId || this.formHorario.invalid) return;
    const v = this.formHorario.getRawValue();
    if (v.horaInicio >= v.horaFin) {
      Swal.fire('Horario inválido', 'La hora de inicio debe ser menor que la hora de fin.', 'warning');
      return;
    }
    this.citaService.guardarHorario({
      medicoId: this.medicoId,
      diaSemana: Number(v.diaSemana),
      horaInicio: `${v.horaInicio}:00`.slice(0, 8),
      horaFin: `${v.horaFin}:00`.slice(0, 8)
    }).subscribe({
      next: () => this.abrirHorarios(),
      error: err => Swal.fire('No se pudo guardar', mensajeError(err), 'error')
    });
  }

  desactivarHorario(horario: HorarioMedico): void {
    if (!horario.id || horario.activo === false) return;
    Swal.fire({
      title: '¿Desactivar horario?',
      text: 'Las citas futuras dejarán de usar esta franja.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Desactivar',
      cancelButtonText: 'Conservar'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.citaService.desactivarHorario(horario.id!).subscribe({
        next: () => this.abrirHorarios(),
        error: err => Swal.fire('No se pudo desactivar', mensajeError(err), 'error')
      });
    });
  }

  // ---------- Reporte Excel de citas (Req. 2.2) ----------

  descargarReporte(): void {
    const { desde, hasta } = this.formReporte.getRawValue();
    if (!desde || !hasta || desde > hasta) {
      Swal.fire('Rango inválido', 'La fecha inicial debe ser menor o igual a la final.', 'warning');
      return;
    }
    this.reportesService.descargar('citas', 'xlsx', desde, hasta, this.medicoId ?? undefined).subscribe({
      next: blob => {
        descargarArchivo(blob, `citas-${this.medico?.apellidos ?? 'medico'}-${desde}-${hasta}.xlsx`);
        this.cerrar('modalReporte');
      },
      error: err => Swal.fire('No se pudo generar', mensajeError(err), 'error')
    });
  }

  // ---------- Utilidades ----------

  abrir(id: string): void {
    const el = document.getElementById(id);
    if (!el) return;
    this.modales[id] ??= new Modal(el);
    this.modales[id].show();
  }

  cerrar(id: string): void {
    this.modales[id]?.hide();
  }

  private leerPreferencia(): string | null {
    try { return localStorage.getItem(MEDICO_KEY); } catch { return null; }
  }

  private inicioDia(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private sumarDias(d: Date, n: number): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }

  private lunesDe(d: Date): Date {
    const dia = (d.getDay() + 6) % 7;
    return this.sumarDias(this.inicioDia(d), -dia);
  }

  private mismoDia(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  private pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  fechaIso(d: Date): string {
    return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}`;
  }

  private fechaHoraIso(d: Date): string {
    return `${this.fechaIso(d)}T${this.pad(d.getHours())}:${this.pad(d.getMinutes())}:${this.pad(d.getSeconds())}`;
  }
}
