import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { esAdmin, esMedico } from 'src/app/utils/rol.util';

type Vista = 'dia' | 'semana' | 'mes';

const iso = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const sumar = (d: Date, n: number): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** Módulo 2 – Calendario del médico veterinario (día, semana y mes) con gestión de citas. */
@Component({
  selector: 'app-calendario-medico',
  imports: [CommonModule, FormsModule],
  styles: [`
    .evento { border-left: 5px solid; border-radius: 4px; padding: 3px 6px; margin-bottom: 4px; cursor: pointer; font-size: 12px; background:#f8f9fa; }
    .evento:hover { background:#e9ecef; }
    .celda-mes { min-height: 105px; border: 1px solid #dee2e6; padding: 3px; vertical-align: top; }
    .hoy { background: #fff8e1; }
    .otro-mes { background: #f4f4f4; color:#999; }
    .col-dia { border-right: 1px solid #eee; min-height: 380px; }
    .leyenda .punto { display:inline-block; width:12px; height:12px; border-radius:3px; margin-right:4px; vertical-align:middle; }
  `],
  template: `
<div class="container-fluid">
  <div class="card">
    <div class="card-header">
      <div class="d-flex flex-wrap align-items-center gap-2 justify-content-between">
        <div class="btn-group">
          <button class="btn btn-outline-secondary" (click)="mover(-1)"><i class="fa fa-chevron-left"></i></button>
          <button class="btn btn-outline-secondary" (click)="hoy()">Hoy</button>
          <button class="btn btn-outline-secondary" (click)="mover(1)"><i class="fa fa-chevron-right"></i></button>
        </div>
        <h5 class="mb-0 text-capitalize">{{ titulo() }}</h5>
        <div class="btn-group">
          <button class="btn" [ngClass]="vista==='dia' ? 'btn-primary' : 'btn-outline-primary'" (click)="cambiarVista('dia')">Día</button>
          <button class="btn" [ngClass]="vista==='semana' ? 'btn-primary' : 'btn-outline-primary'" (click)="cambiarVista('semana')">Semana</button>
          <button class="btn" [ngClass]="vista==='mes' ? 'btn-primary' : 'btn-outline-primary'" (click)="cambiarVista('mes')">Mes</button>
        </div>
        <div>
          <select class="form-select d-inline-block w-auto me-2" *ngIf="admin" [(ngModel)]="medicoId" (change)="cargar()">
            <option [ngValue]="null">Seleccione un veterinario</option>
            <option *ngFor="let m of medicos" [ngValue]="m.id">{{ m.nombres }} {{ m.apellidos }} — {{ m.especialidad }}</option>
          </select>
          <button class="btn btn-success me-1" *ngIf="medico" (click)="nueva()"><i class="fa fa-plus"></i> Nueva cita</button>
          <button class="btn btn-outline-success" (click)="reporte = !reporte"><i class="fa fa-file-excel"></i> Reporte</button>
        </div>
      </div>
      <div class="leyenda mt-2 small">
        <span *ngFor="let e of estados" class="me-3"><span class="punto" [style.background]="e.color"></span>{{ e.nombre }}</span>
      </div>
      <div class="row g-2 mt-2" *ngIf="reporte">
        <div class="col-auto"><label class="form-label mb-0 small">Desde</label><input type="date" class="form-control" [(ngModel)]="repDesde" /></div>
        <div class="col-auto"><label class="form-label mb-0 small">Hasta</label><input type="date" class="form-control" [(ngModel)]="repHasta" /></div>
        <div class="col-auto d-flex align-items-end"><button class="btn btn-success" (click)="descargarReporte()">Descargar Excel</button></div>
      </div>
    </div>

    <div class="card-body">
      <div class="alert alert-info py-2" *ngIf="admin && !medicoId">Seleccione un veterinario para consultar su calendario (el administrador solo consulta).</div>
      <div class="small text-muted mb-2" *ngIf="horarios.length">Disponibilidad: <span *ngFor="let h of horarios" class="badge bg-light text-dark border me-1">{{ dias[h.diaSemana] }} {{ h.horaInicio }}–{{ h.horaFin }}</span></div>

      <!-- DÍA y SEMANA -->
      <div class="row g-0" *ngIf="vista !== 'mes'">
        <div class="col col-dia px-1" *ngFor="let d of diasVista()" [class.hoy]="iso(d) === iso(ahora)">
          <div class="text-center fw-bold border-bottom mb-1 py-1">{{ d | date:'EEE d MMM' }}</div>
          <div *ngIf="eventosDe(d).length === 0" class="text-center text-muted small mt-3">Sin citas</div>
          <div class="evento" *ngFor="let e of eventosDe(d)" [style.border-left-color]="e.color" (click)="abrir(e)">
            <strong>{{ e.inicio | date:'HH:mm' }}–{{ e.fin | date:'HH:mm' }}</strong> · {{ e.nombreMascota }}<br />
            <span class="text-muted">{{ e.propietario }}</span><br /><span class="badge" [style.background]="e.color">{{ e.estadoNombre }}</span>
          </div>
        </div>
      </div>

      <!-- MES -->
      <table class="table table-borderless mb-0" *ngIf="vista === 'mes'">
        <thead><tr><th *ngFor="let n of ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']" class="text-center">{{ n }}</th></tr></thead>
        <tbody>
          <tr *ngFor="let semana of semanasMes()">
            <td *ngFor="let d of semana" class="celda-mes" [class.hoy]="iso(d) === iso(ahora)" [class.otro-mes]="d.getMonth() !== ref.getMonth()">
              <div class="text-end small fw-bold" style="cursor:pointer" (click)="irADia(d)">{{ d.getDate() }}</div>
              <div class="evento" *ngFor="let e of eventosDe(d).slice(0,3)" [style.border-left-color]="e.color" (click)="abrir(e)">
                {{ e.inicio | date:'HH:mm' }} {{ e.nombreMascota }}
              </div>
              <div class="small text-primary" style="cursor:pointer" *ngIf="eventosDe(d).length > 3" (click)="irADia(d)">+{{ eventosDe(d).length - 3 }} más</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- Detalle de la cita -->
<div *ngIf="sel" class="modal d-block" style="background:rgba(0,0,0,.45)">
  <div class="modal-dialog modal-lg"><div class="modal-content">
    <div class="modal-header" [style.border-top]="'6px solid ' + sel.color">
      <h5 class="modal-title">Cita #{{ sel.id }} <span class="badge" [style.background]="sel.color">{{ sel.estadoNombre }}</span></h5>
      <button class="btn-close" (click)="sel = null"></button>
    </div>
    <div class="modal-body">
      <div class="row g-2">
        <div class="col-md-6"><strong>Fecha:</strong> {{ sel.inicio | date:'EEEE d MMM yyyy' }}</div>
        <div class="col-md-6"><strong>Hora:</strong> {{ sel.inicio | date:'HH:mm' }} – {{ sel.fin | date:'HH:mm' }} ({{ sel.duracionMin }} min)</div>
        <div class="col-md-6"><strong>Mascota:</strong> {{ sel.nombreMascota }} ({{ sel.especie }} · {{ sel.raza }}{{ sel.mascotaEdad != null ? ' · ' + sel.mascotaEdad + ' años' : '' }})</div>
        <div class="col-md-6"><strong>Propietario:</strong> {{ sel.propietario }} · {{ sel.propietarioTelefono }}</div>
        <div class="col-md-6"><strong>Veterinario:</strong> {{ sel.medicoNombre }} ({{ sel.especialidad }})</div>
        <div class="col-md-6"><strong>Motivo:</strong> {{ sel.motivo || '—' }}</div>
        <div class="col-12" *ngIf="sel.estado === 'CANCELADA'"><div class="alert alert-danger py-2 mb-0"><strong>Cancelada:</strong> {{ sel.motivoCancelacion }} ({{ sel.fechaCancelacion | date:'yyyy-MM-dd HH:mm' }})</div></div>
      </div>
      <div class="mt-3" *ngIf="historial">
        <h6>Historial de citas de {{ sel.nombreMascota }}</h6>
        <table class="table table-sm"><thead><tr><th>Fecha</th><th>Veterinario</th><th>Estado</th><th>Motivo</th></tr></thead>
          <tbody><tr *ngFor="let h of historial"><td>{{ h.inicio | date:'yyyy-MM-dd HH:mm' }}</td><td>{{ h.medicoNombre }}</td><td><span class="badge" [style.background]="h.color">{{ h.estadoNombre }}</span></td><td>{{ h.motivo }}</td></tr></tbody></table>
      </div>
    </div>
    <div class="modal-footer justify-content-between">
      <button class="btn btn-outline-secondary" (click)="verHistorial()"><i class="fa fa-clock-rotate-left"></i> Historial de la mascota</button>
      <div *ngIf="medico">
        <button class="btn btn-outline-primary me-1" *ngIf="sel.estado === 'PENDIENTE'" (click)="accion('confirmar')">Confirmar</button>
        <button class="btn btn-outline-secondary me-1" *ngIf="sel.estado === 'PENDIENTE' || sel.estado === 'CONFIRMADA'" (click)="editar()">Reprogramar / editar</button>
        <button class="btn btn-outline-danger me-1" *ngIf="sel.estado === 'PENDIENTE' || sel.estado === 'CONFIRMADA'" (click)="cancelar()">Cancelar cita</button>
        <button class="btn btn-outline-success me-1" *ngIf="sel.estado === 'PENDIENTE' || sel.estado === 'CONFIRMADA'" (click)="atendida()">Marcar atendida</button>
        <button class="btn btn-primary" *ngIf="sel.estado === 'PENDIENTE' || sel.estado === 'CONFIRMADA' || sel.estado === 'EN_ATENCION'" (click)="iniciarAtencion()"><i class="fa fa-stethoscope"></i> {{ sel.estado === 'EN_ATENCION' ? 'Continuar atención' : 'Iniciar atención' }}</button>
      </div>
    </div>
  </div></div>
</div>

<!-- Crear / editar -->
<div *ngIf="form" class="modal d-block" style="background:rgba(0,0,0,.45)">
  <div class="modal-dialog"><div class="modal-content">
    <div class="modal-header"><h5 class="modal-title">{{ form.id ? 'Reprogramar / editar cita' : 'Nueva cita' }}</h5><button class="btn-close" (click)="form = null"></button></div>
    <div class="modal-body"><div class="row g-3">
      <div class="col-12"><label class="form-label">Mascota *</label>
        <select class="form-select" [(ngModel)]="form.mascotaId">
          <option [ngValue]="null">Seleccione…</option>
          <option *ngFor="let m of mascotas" [ngValue]="m.id">{{ m.nombre }} ({{ m.especie }}) — {{ m.propietario }}</option>
        </select></div>
      <div class="col-6"><label class="form-label">Fecha *</label><input type="date" class="form-control" [(ngModel)]="form.fecha" /></div>
      <div class="col-6"><label class="form-label">Hora *</label><input type="time" class="form-control" [(ngModel)]="form.hora" step="600" /></div>
      <div class="col-6"><label class="form-label">Duración (min)</label><input type="number" min="10" max="240" step="5" class="form-control" [(ngModel)]="form.duracionMin" /></div>
      <div class="col-12"><label class="form-label">Motivo</label><input class="form-control" [(ngModel)]="form.motivo" /></div>
    </div></div>
    <div class="modal-footer"><button class="btn btn-secondary" (click)="form = null">Cerrar</button><button class="btn btn-primary" (click)="guardar()">Guardar</button></div>
  </div></div>
</div>
`,
})
export class CalendarioMedicoComponent implements OnInit {
  readonly iso = iso;
  readonly dias = ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  readonly estados = [
    { nombre: 'Pendiente', color: '#f0ad4e' }, { nombre: 'Confirmada', color: '#0d6efd' }, { nombre: 'En atención', color: '#6f42c1' },
    { nombre: 'Atendida', color: '#198754' }, { nombre: 'Finalizada', color: '#6c757d' }, { nombre: 'Cancelada', color: '#dc3545' },
  ];
  admin = esAdmin();
  vista: Vista = 'semana';
  ref = new Date();
  ahora = new Date();
  eventos: any[] = [];
  horarios: any[] = [];
  medico: any = null;
  medicos: any[] = [];
  medicoId: number | null = null;
  sel: any = null;
  historial: any[] | null = null;
  form: any = null;
  mascotas: any[] = [];
  reporte = false;
  repDesde = iso(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  repHasta = iso(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));

  constructor(private readonly api: ApiService, private readonly router: Router) {}

  ngOnInit(): void {
    if (esMedico()) {
      this.api.get<any>('/citas-medicas/mi-medico').subscribe({
        next: (m) => {
          this.medico = m;
          this.medicoId = m.id;
          this.cargar();
          this.cargarMascotas();
        },
        error: (e) => this.api.error(e),
      });
    } else {
      this.api.get<any[]>('/citas-medicas/medicos').subscribe({ next: (m) => (this.medicos = m), error: (e) => this.api.error(e) });
    }
  }

  private cargarMascotas(): void {
    this.api.get<any[]>('/citas-medicas/mascotas').subscribe({ next: (m) => (this.mascotas = m), error: (e) => this.api.error(e) });
  }

  // ---- navegación
  rango(): { inicio: Date; fin: Date } {
    if (this.vista === 'dia') return { inicio: this.ref, fin: this.ref };
    if (this.vista === 'semana') {
      const ini = sumar(this.ref, -((this.ref.getDay() + 6) % 7));
      return { inicio: ini, fin: sumar(ini, 6) };
    }
    const primero = new Date(this.ref.getFullYear(), this.ref.getMonth(), 1);
    const ultimo = new Date(this.ref.getFullYear(), this.ref.getMonth() + 1, 0);
    return { inicio: sumar(primero, -((primero.getDay() + 6) % 7)), fin: sumar(ultimo, (7 - ((ultimo.getDay() + 6) % 7) - 1)) };
  }

  titulo(): string {
    const r = this.rango();
    if (this.vista === 'dia') return this.ref.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (this.vista === 'mes') return this.ref.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    return `${r.inicio.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} – ${r.fin.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }

  cambiarVista(v: Vista): void {
    this.vista = v;
    this.cargar();
  }

  mover(n: number): void {
    if (this.vista === 'dia') this.ref = sumar(this.ref, n);
    else if (this.vista === 'semana') this.ref = sumar(this.ref, 7 * n);
    else this.ref = new Date(this.ref.getFullYear(), this.ref.getMonth() + n, 1);
    this.cargar();
  }

  hoy(): void {
    this.ref = new Date();
    this.cargar();
  }

  irADia(d: Date): void {
    this.ref = d;
    this.vista = 'dia';
    this.cargar();
  }

  diasVista(): Date[] {
    const r = this.rango();
    return Array.from({ length: this.vista === 'dia' ? 1 : 7 }, (_, i) => sumar(r.inicio, i));
  }

  semanasMes(): Date[][] {
    const r = this.rango();
    const total = Math.round((r.fin.getTime() - r.inicio.getTime()) / 86400000) + 1;
    const dias = Array.from({ length: total }, (_, i) => sumar(r.inicio, i));
    return Array.from({ length: total / 7 }, (_, i) => dias.slice(i * 7, i * 7 + 7));
  }

  eventosDe(d: Date): any[] {
    const k = iso(d);
    return this.eventos.filter((e) => String(e.inicio).startsWith(k));
  }

  cargar(): void {
    if (!this.medicoId) {
      this.eventos = [];
      this.horarios = [];
      return;
    }
    const r = this.rango();
    this.api.get<any[]>('/citas-medicas/calendario', { inicio: iso(r.inicio), fin: iso(r.fin), medicoId: this.medicoId }).subscribe({
      next: (e) => (this.eventos = e),
      error: (e) => this.api.error(e),
    });
    this.api.get<any[]>('/citas-medicas/horarios', { medicoId: this.medicoId }).subscribe({ next: (h) => (this.horarios = h), error: () => undefined });
  }

  // ---- acciones sobre la cita
  abrir(e: any): void {
    this.sel = e;
    this.historial = null;
  }

  verHistorial(): void {
    this.api.get<any[]>(`/citas-medicas/mascota/${this.sel.mascotaId}`).subscribe({ next: (h) => (this.historial = h), error: (e) => this.api.error(e) });
  }

  private refrescar(msg: string): void {
    this.sel = null;
    this.form = null;
    this.api.ok(msg);
    this.cargar();
  }

  accion(a: 'confirmar'): void {
    this.api.post(`/citas-medicas/${this.sel.id}/${a}`).subscribe({ next: () => this.refrescar('Cita confirmada'), error: (e) => this.api.error(e) });
  }

  async cancelar(): Promise<void> {
    const motivo = await this.api.pedirTexto('Cancelar cita', 'Motivo de la cancelación (la cita se conserva en el historial)');
    if (!motivo) return;
    this.api.post(`/citas-medicas/${this.sel.id}/cancelar`, { motivo }).subscribe({ next: () => this.refrescar('Cita cancelada'), error: (e) => this.api.error(e) });
  }

  async atendida(): Promise<void> {
    if (!(await this.api.confirmar('Marcar como atendida', 'Se registra una atención mínima. Para diagnóstico y fórmula use «Iniciar atención».'))) return;
    this.api.post(`/citas-medicas/${this.sel.id}/atendida`).subscribe({ next: () => this.refrescar('Cita marcada como atendida'), error: (e) => this.api.error(e) });
  }

  iniciarAtencion(): void {
    this.api.post<any>(`/atencion/iniciar/${this.sel.id}`).subscribe({
      next: (a) => this.router.navigate(['/inicio/atencion', a.id]),
      error: (e) => this.api.error(e),
    });
  }

  // ---- crear / editar
  nueva(): void {
    this.form = { mascotaId: null, fecha: iso(this.ref), hora: '08:00', duracionMin: 30, motivo: '' };
  }

  editar(): void {
    const s = this.sel;
    this.form = { id: s.id, mascotaId: s.mascotaId, fecha: String(s.inicio).substring(0, 10), hora: String(s.inicio).substring(11, 16), duracionMin: s.duracionMin, motivo: s.motivo };
    this.sel = null;
  }

  guardar(): void {
    const f = this.form;
    if (!f.mascotaId || !f.fecha || !f.hora) {
      this.api.error({ message: 'Complete mascota, fecha y hora.' });
      return;
    }
    const body = { mascotaId: f.mascotaId, fechaHora: `${f.fecha}T${f.hora}`, duracionMin: f.duracionMin, motivo: f.motivo };
    const req = f.id ? this.api.put(`/citas-medicas/${f.id}`, body) : this.api.post('/citas-medicas', body);
    req.subscribe({ next: () => this.refrescar('Cita guardada'), error: (e) => this.api.error(e) });
  }

  descargarReporte(): void {
    if (!this.medicoId) {
      this.api.error({ message: 'Seleccione un veterinario.' });
      return;
    }
    this.api.descargar('/citas-medicas/reporte/excel', `citas-${this.repDesde}_${this.repHasta}.xlsx`, { inicio: this.repDesde, fin: this.repHasta, medicoId: this.medicoId });
  }
}
