import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

type Vista = 'dia' | 'semana' | 'mes' | 'rango';
interface CitaAgenda {
  id: number;
  fecha_hora?: string;
  fechaHora?: string;
  medico_id?: number;
  medicoId?: number;
  medico?: { id?: number; nombre?: string; apellido?: string };
  mascota_id?: number;
  mascotaId?: number;
  mascota?: { id?: number; nombre?: string };
  estado?: string;
  motivo?: string;
}

@Component({
  selector: 'app-agenda-medica-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <section class="container py-3">
    <h3>Agenda médica</h3>
    <p>Consulta las citas por día, semana, mes o rango personalizado.</p>
    <div class="btn-group mb-3" role="group" aria-label="Vista de la agenda">
      <button *ngFor="let v of vistas" type="button"
        class="btn" [ngClass]="vista === v.id ? 'btn-primary' : 'btn-outline-primary'"
        (click)="seleccionarVista(v.id)">{{ v.texto }}</button>
    </div>
    <div class="row g-3 align-items-end mb-3">
      <div class="col-md-3" *ngIf="vista !== 'rango'">
        <label for="referencia" class="form-label">Fecha de referencia</label>
        <input id="referencia" class="form-control" type="date" [(ngModel)]="referencia" (ngModelChange)="actualizarRango()">
      </div>
      <div class="col-md-3" *ngIf="vista === 'rango'">
        <label for="desde" class="form-label">Desde</label>
        <input id="desde" class="form-control" type="date" [(ngModel)]="inicio">
      </div>
      <div class="col-md-3" *ngIf="vista === 'rango'">
        <label for="hasta" class="form-label">Hasta</label>
        <input id="hasta" class="form-control" type="date" [(ngModel)]="fin">
      </div>
      <div class="col-md-3">
        <label for="medico" class="form-label">ID del veterinario (opcional)</label>
        <input id="medico" class="form-control" type="number" min="1" step="1" [(ngModel)]="medicoId">
      </div>
      <div class="col-md-3">
        <button class="btn btn-primary" [disabled]="cargando" (click)="cargar()">Consultar citas</button>
      </div>
    </div>
    <p class="text-muted">Período: {{ inicio }} a {{ fin }}</p>
    <div *ngIf="error" class="alert alert-danger" role="alert">{{ error }}</div>
    <div *ngIf="cargando" role="status">Cargando agenda...</div>
    <div *ngIf="consultado && !cargando" class="mb-2">
      <strong>{{ citas.length }}</strong> cita(s) encontradas.
    </div>
    <div class="table-responsive" *ngIf="consultado && !cargando">
      <table class="table table-striped">
        <thead><tr><th>ID</th><th>Fecha y hora</th><th>Veterinario</th><th>Mascota</th><th>Estado</th><th>Motivo</th></tr></thead>
        <tbody>
          <tr *ngFor="let c of citas">
            <td>{{ c.id }}</td>
            <td>{{ fechaCita(c) | date:'yyyy-MM-dd HH:mm' }}</td>
            <td>{{ c.medico?.nombre ? (c.medico?.nombre + ' ' + (c.medico?.apellido || '')) : (c.medico?.id || c.medico_id || c.medicoId || '—') }}</td>
            <td>{{ c.mascota?.nombre || c.mascota?.id || c.mascota_id || c.mascotaId || '—' }}</td>
            <td>{{ c.estado || '—' }}</td><td>{{ c.motivo || '—' }}</td>
          </tr>
        </tbody>
      </table>
      <p *ngIf="!citas.length">No hay citas para el período consultado.</p>
    </div>
  </section>`
})
export class AgendaMedicaPanelComponent {
  private readonly http = inject(HttpClient);
  readonly vistas: Array<{id: Vista; texto: string}> = [
    {id:'dia', texto:'Día'}, {id:'semana', texto:'Semana'},
    {id:'mes', texto:'Mes'}, {id:'rango', texto:'Rango'}
  ];
  vista: Vista = 'semana';
  referencia = this.formatoFecha(new Date());
  inicio = '';
  fin = '';
  medicoId: number | null = null;
  citas: CitaAgenda[] = [];
  error = '';
  cargando = false;
  consultado = false;

  constructor() { this.actualizarRango(); }

  private formatoFecha(d: Date): string {
    return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
  }

  seleccionarVista(v: Vista): void {
    this.vista = v;
    this.consultado = false;
    this.citas = [];
    if (v !== 'rango') this.actualizarRango();
  }

  actualizarRango(): void {
    if (this.vista === 'rango' || !this.referencia) return;
    const fecha = new Date(this.referencia + 'T12:00:00');
    if (Number.isNaN(fecha.getTime())) return;
    const desde = new Date(fecha);
    const hasta = new Date(fecha);
    if (this.vista === 'semana') {
      const lunes = (fecha.getDay() + 6) % 7;
      desde.setDate(fecha.getDate() - lunes);
      hasta.setDate(desde.getDate() + 6);
    } else if (this.vista === 'mes') {
      desde.setDate(1);
      hasta.setMonth(fecha.getMonth() + 1, 0);
    }
    this.inicio = this.formatoFecha(desde);
    this.fin = this.formatoFecha(hasta);
  }

  fechaCita(c: CitaAgenda): string { return c.fecha_hora || c.fechaHora || ''; }

  cargar(): void {
    this.error = '';
    if (!this.inicio || !this.fin || this.inicio > this.fin) {
      this.error = 'Selecciona un rango de fechas válido.'; return;
    }
    if (this.medicoId !== null &&
        (!Number.isInteger(Number(this.medicoId)) || Number(this.medicoId) <= 0)) {
      this.error = 'El ID del veterinario debe ser un entero positivo.'; return;
    }
    let params = new HttpParams().set('inicio', this.inicio).set('fin', this.fin);
    if (this.medicoId !== null) params = params.set('medicoId', String(this.medicoId));
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders(token ? {Authorization: 'Bearer ' + token} : {});
    this.cargando = true;
    this.consultado = false;
    this.http.get<CitaAgenda[]>(environment.apiUrlAuth + '/cita/agenda', {params, headers}).subscribe({
      next: (respuesta) => {
        this.citas = (Array.isArray(respuesta) ? respuesta : []).slice().sort(
          (a,b) => this.fechaCita(a).localeCompare(this.fechaCita(b)));
        this.cargando = false;
        this.consultado = true;
      },
      error: (e) => {
        this.error = e.error?.message || 'No fue posible consultar la agenda médica.';
        this.cargando = false;
      }
    });
  }
}
