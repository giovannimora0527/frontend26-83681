import { afterNextRender, Component, ElementRef, inject, Injector, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Mascota } from 'src/app/models/mascota';
import { CitaAgenda, ClinicaApi, fechaLocal, hoyBogota } from './clinica-api.service';
import { finalize, Subscription } from 'rxjs';

/** Enumera las formas de presentar las citas en la agenda. */
type Vista = 'dia' | 'semana' | 'mes';
/** Contiene la información de una cita que aparece en el historial de la mascota. */
interface CitaHistorial { id: number; fechaHora: string; estado: string; motivo: string }

/** Presenta la agenda del veterinario y permite consultar, programar y reprogramar citas. */
@Component({
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './agenda.component.html',
  styles: [`
    .agenda { display: grid; gap: .5rem; }
    .dia { min-height: 90px; min-width: 0; }
    @media (min-width: 992px) {
      .agenda-semanal { grid-template-columns: repeat(7, minmax(0, 1fr)); }
      .inicio-mes { grid-column-start: var(--dia-inicial); }
    }
  `]
})
export class AgendaComponent implements OnInit {
  private readonly api = inject(ClinicaApi);
  private readonly injector = inject(Injector);
  private readonly tituloDetalle = viewChild<ElementRef<HTMLElement>>('tituloDetalle');
  private readonly campoInicio = viewChild<ElementRef<HTMLInputElement>>('campoInicio');
  private botonCita?: HTMLElement;
  private readonly formatoFechaHora = new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  });
  private readonly formatoDia = new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota', weekday: 'short', day: 'numeric', month: 'short'
  });
  private solicitud?: Subscription;
  readonly vistas: Vista[] = ['dia', 'semana', 'mes'];
  readonly estados = ['PROGRAMADA', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA', 'NO_ASISTIDA'];
  vista: Vista = 'semana';
  fecha = hoyBogota();
  desde = this.fecha;
  hasta = this.fecha;
  filtro = '';
  dias: string[] = [];
  diaInicial = 1;
  citas: CitaAgenda[] = [];
  mascotas: Mascota[] = [];
  historial: CitaHistorial[] | null = null;
  mascotaHistorialId: number | null = null;
  cargandoHistorial = false;
  private consultaHistorial?: Subscription;
  seleccion: CitaAgenda | null = null;
  modo: 'nuevo' | 'editar' | 'reprogramar' | null = null;
  form = this.nuevaCita();
  error = '';
  aviso = '';
  cargando = false;
  guardando = false;
  private readonly mostrarError = this.api.error((mensaje) => this.error = mensaje);

  /** Prepara la pantalla al abrirse y carga los datos que necesita. */
  ngOnInit() {
    this.cargar();
    this.api.leer<Mascota[]>('mascota/listar').subscribe({ next: (mascotas) => this.mascotas = mascotas, error: this.mostrarError });
  }

  /** Prepara una cita para registrarla desde el formulario. */
  nuevaCita() {
    return { mascotaId: null as number | null, fechaHora: '', motivo: '', duracionMinutos: null as number | null,
      estado: 'PROGRAMADA', motivoCancelacion: '' };
  }

  /** Obtiene las citas cuya fecha programada coincide con el día de la agenda. */
  citasDelDia(dia: string) {
    return this.citas.filter((cita) => cita.inicio < this.siguienteDia(dia) + 'T00:00:00'
      && cita.fin > dia + 'T00:00:00' && (!this.filtro || cita.estado === this.filtro));
  }

  /** Cuenta las citas de la vista actual que están en el estado indicado. */
  totalPorEstado(estado: string): number {
    return this.citas.filter((cita) => cita.estado === estado).length;
  }

  /** Obtiene la fecha calendario inmediatamente posterior al día indicado. */
  private siguienteDia(dia: string) {
    const fecha = new Date(dia + 'T12:00:00');
    fecha.setDate(fecha.getDate() + 1);
    return fechaLocal(fecha);
  }

  /** Avanza o retrocede el período visible de la agenda. */
  mover(pasos: number) {
    if (!this.fecha) return;
    const fecha = new Date(this.fecha + 'T12:00:00');
    if (this.vista === 'mes') fecha.setMonth(fecha.getMonth() + pasos, 1);
    else fecha.setDate(fecha.getDate() + pasos * (this.vista === 'semana' ? 7 : 1));
    this.fecha = fechaLocal(fecha);
    this.cargar();
  }

  /** Consulta las citas del veterinario para el período visible. */
  cargar() {
    this.solicitud?.unsubscribe();
    this.limpiarDetalle();
    this.aviso = '';
    this.error = '';
    this.citas = [];
    this.dias = [];
    if (!this.fecha) return;
    const inicio = new Date(this.fecha + 'T12:00:00');
    if (this.vista === 'mes') inicio.setDate(1);
    if (this.vista === 'semana') inicio.setDate(inicio.getDate() - (inicio.getDay() + 6) % 7);
    this.diaInicial = (inicio.getDay() + 6) % 7 + 1;
    const fin = new Date(inicio);
    if (this.vista === 'mes') fin.setMonth(fin.getMonth() + 1);
    else fin.setDate(fin.getDate() + (this.vista === 'semana' ? 7 : 1));
    const cursor = new Date(inicio);
    while (cursor < fin) {
      this.dias.push(fechaLocal(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    this.cargando = true;
    this.solicitud = this.api.leer<CitaAgenda[]>('cita/calendario', {
      inicio: fechaLocal(inicio) + 'T00:00:00', fin: fechaLocal(fin) + 'T00:00:00'
    }).pipe(finalize(() => this.cargando = false))
      .subscribe({ next: (citas) => this.citas = citas, error: this.mostrarError });
  }

  /** Abre el detalle de la cita y sus datos asociados. */
  abrir(cita: CitaAgenda, evento?: Event) {
    this.limpiarDetalle();
    if (evento?.currentTarget instanceof HTMLElement) this.botonCita = evento.currentTarget;
    this.seleccion = cita;
    afterNextRender(() => this.tituloDetalle()?.nativeElement.focus(), { injector: this.injector });
  }

  /** Cierra el detalle y limpia la selección actual. */
  cerrarDetalle() {
    const boton = this.botonCita;
    this.limpiarDetalle();
    boton?.focus();
  }

  /** Restablece los datos temporales del detalle de la cita. */
  private limpiarDetalle() {
    this.consultaHistorial?.unsubscribe();
    this.cargandoHistorial = false;
    this.seleccion = null;
    this.historial = null;
    this.modo = null;
    this.botonCita = undefined;
  }

  /** Da formato a la hora de la cita para mostrarla en la agenda. */
  mostrarHora(fechaHora: string): string {
    return this.formatoFechaHora.format(new Date(fechaHora + '-05:00'));
  }

  /** Da formato a la fecha para mostrarla en la agenda. */
  mostrarDia(fecha: string): string {
    return this.formatoDia.format(new Date(fecha + 'T12:00:00-05:00'));
  }

  /** Prepara el formulario para crear, editar o reprogramar una cita. */
  editar(modo: 'nuevo' | 'editar' | 'reprogramar') {
    this.modo = modo;
    this.form = this.nuevaCita();
    const cita = this.seleccion;
    if (modo !== 'nuevo' && cita) {
      this.form = { ...this.form, mascotaId: cita.mascotaId, fechaHora: cita.inicio.slice(0, 16),
        motivo: cita.motivo, estado: cita.estado,
        duracionMinutos: (Date.parse(cita.fin + '-05:00') - Date.parse(cita.inicio + '-05:00')) / 60000 };
    }
    afterNextRender(() => this.campoInicio()?.nativeElement.focus(), { injector: this.injector });
  }

  /** Valida y envía los datos de la cita según la acción elegida. */
  guardar() {
    if (!this.modo || this.guardando) return;
    const cita = this.seleccion;
    const form = { ...this.form, motivo: this.form.motivo.trim(), motivoCancelacion: this.form.motivoCancelacion.trim() };
    const reprogramar = this.modo === 'reprogramar';
    const editar = this.modo === 'editar';
    if (!form.fechaHora || (!reprogramar && (!form.mascotaId || !form.motivo))
      || (form.duracionMinutos !== null && (!Number.isInteger(form.duracionMinutos) || form.duracionMinutos < 1))
      || (editar && form.estado === 'CANCELADA' && !form.motivoCancelacion)) {
      this.error = 'Completa los datos obligatorios.';
      return;
    }
    const ruta = reprogramar ? `cita/${cita?.id}/reprogramar` : editar ? 'cita/actualizar' : 'cita/crear';
    const datos = reprogramar ? { fechaHora: form.fechaHora }
      : editar ? { ...form, id: cita?.id, medicoId: cita?.medicoId } : form;
    this.error = '';
    this.guardando = true;
    this.api.enviar<CitaAgenda | { message: string }>(reprogramar ? 'PATCH' : 'POST', ruta, datos)
      .pipe(finalize(() => this.guardando = false))
      .subscribe({
        next: (respuesta) => {
          if (reprogramar && 'inicio' in respuesta) {
            const fechaDestino = respuesta.inicio.slice(0, 10);
            if (!this.dias.includes(fechaDestino)) this.fecha = fechaDestino;
            this.cargar();
            this.aviso = `Cita reprogramada para el ${this.mostrarHora(respuesta.inicio)} (hora de Bogotá).`;
            return;
          }
          this.cargar();
        },
        error: this.mostrarError
      });
  }

  /** Consulta el historial. */
  consultarHistorial(mascotaId: number) {
    this.consultaHistorial?.unsubscribe();
    this.mascotaHistorialId = mascotaId;
    this.historial = null;
    this.error = '';
    this.cargandoHistorial = true;
    this.consultaHistorial = this.api.leer<CitaHistorial[]>('cita/listar-por-mascota', { mascotaId })
      .pipe(finalize(() => this.cargandoHistorial = false))
      .subscribe({ next: (historial) => this.historial = historial, error: this.mostrarError });
  }

  /** Convierte el estado interno en el texto que se muestra en pantalla. */
  etiquetaEstado(estado: string): string {
    if (estado === 'PROGRAMADA') return 'Pendiente';
    if (estado === 'ATENDIDA') return 'Finalizada';
    return estado.replace('_', ' ');
  }

  /** Descarga en Excel las citas del período seleccionado. */
  exportar() {
    if (!this.desde || !this.hasta || this.desde > this.hasta) return;
    this.api.descargar('cita/calendario/excel', 'agenda-veterinaria.xlsx', (mensaje) => this.error = mensaje,
      { inicio: this.desde, fin: this.hasta });
  }

  /** Asocia al estado de la cita la clase visual que se usa en la agenda. */
  color(estado: string): string {
    return ({ PROGRAMADA: 'primary', CONFIRMADA: 'info', ATENDIDA: 'success', CANCELADA: 'danger',
      NO_ASISTIDA: 'secondary' } as Record<string, string>)[estado] ?? 'secondary';
  }
}
