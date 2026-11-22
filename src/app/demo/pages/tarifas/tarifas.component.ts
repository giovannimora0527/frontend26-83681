import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { esAdmin } from 'src/app/utils/rol.util';

/** Administración de especialidades veterinarias y tarifas (con registro de cambios). */
@Component({
  selector: 'app-tarifas',
  imports: [CommonModule, FormsModule],
  template: `
<div class="container-fluid">
  <ul class="nav nav-tabs mb-3">
    <li class="nav-item"><a class="nav-link" [class.active]="tab==='tarifas'" role="button" (click)="tab='tarifas'">Tarifas y servicios</a></li>
    <li class="nav-item"><a class="nav-link" [class.active]="tab==='esp'" role="button" (click)="tab='esp'">Especialidades</a></li>
    <li class="nav-item"><a class="nav-link" [class.active]="tab==='log'" role="button" (click)="tab='log'; cargarLog()">Historial de cambios</a></li>
  </ul>

  <!-- TARIFAS -->
  <div class="card" *ngIf="tab==='tarifas'">
    <div class="card-header">
      <div class="row g-2">
        <div class="col-md-3"><select class="form-select" [(ngModel)]="fTipo" (change)="cargarTarifas()"><option value="">Todos los tipos</option><option value="CONSULTA">Consulta</option><option value="PROCEDIMIENTO">Procedimiento</option><option value="SERVICIO">Servicio</option></select></div>
        <div class="col-md-3"><select class="form-select" [(ngModel)]="fEsp" (change)="cargarTarifas()"><option value="">Todas las especialidades</option><option *ngFor="let e of especialidades" [value]="e.id">{{ e.nombre }}</option></select></div>
        <div class="col-md-3"><select class="form-select" [(ngModel)]="fActivo" (change)="cargarTarifas()"><option value="">Activas e inactivas</option><option value="true">Activas</option><option value="false">Inactivas</option></select></div>
        <div class="col-md-3 text-end"><button class="btn btn-outline-primary" *ngIf="admin" (click)="nuevaTarifa()"><i class="fa fa-plus"></i> Nueva tarifa</button></div>
      </div>
    </div>
    <div class="card-body table-responsive">
      <table class="table table-sm table-hover">
        <thead><tr><th>Código</th><th>Nombre</th><th>Tipo</th><th>Especialidad</th><th class="text-end">Valor</th><th class="text-end">IVA %</th><th class="text-end">Valor + IVA</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let t of tarifas" [class.table-secondary]="!t.activo">
            <td><code>{{ t.codigo }}</code></td><td>{{ t.nombre }}</td><td>{{ t.tipo }}</td><td>{{ t.especialidad || 'General' }}</td>
            <td class="text-end">{{ t.valor | currency:'COP':'symbol-narrow':'1.0-0' }}</td><td class="text-end">{{ t.ivaPorcentaje }}</td><td class="text-end">{{ t.valorConIva | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
            <td><span class="badge" [ngClass]="t.activo ? 'bg-success' : 'bg-secondary'">{{ t.activo ? 'Activa' : 'Inactiva' }}</span></td>
            <td class="text-nowrap" *ngIf="admin">
              <button class="btn btn-sm btn-outline-primary me-1" (click)="editarTarifa(t)"><i class="fa fa-pen"></i></button>
              <button class="btn btn-sm" [ngClass]="t.activo ? 'btn-outline-danger' : 'btn-outline-success'" (click)="estadoTarifa(t)"><i class="fa" [ngClass]="t.activo ? 'fa-ban' : 'fa-check'"></i></button>
            </td>
            <td *ngIf="!admin"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ESPECIALIDADES -->
  <div class="card" *ngIf="tab==='esp'">
    <div class="card-header text-end"><button class="btn btn-outline-primary" *ngIf="admin" (click)="nuevaEsp()"><i class="fa fa-plus"></i> Nueva especialidad</button></div>
    <div class="card-body table-responsive">
      <table class="table table-sm">
        <thead><tr><th>Código</th><th>Nombre</th><th>Descripción</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let e of especialidades" [class.table-secondary]="!e.activo">
            <td><code>{{ e.codigoEspecializacion }}</code></td><td>{{ e.nombre }}</td><td>{{ e.descripcion }}</td>
            <td><span class="badge" [ngClass]="e.activo ? 'bg-success' : 'bg-secondary'">{{ e.activo ? 'Activa' : 'Inactiva' }}</span></td>
            <td class="text-nowrap" *ngIf="admin">
              <button class="btn btn-sm btn-outline-primary me-1" (click)="editarEsp(e)"><i class="fa fa-pen"></i></button>
              <button class="btn btn-sm" [ngClass]="e.activo ? 'btn-outline-danger' : 'btn-outline-success'" (click)="estadoEsp(e)"><i class="fa" [ngClass]="e.activo ? 'fa-ban' : 'fa-check'"></i></button>
            </td>
            <td *ngIf="!admin"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- LOG -->
  <div class="card" *ngIf="tab==='log'">
    <div class="card-body table-responsive">
      <table class="table table-sm">
        <thead><tr><th>Fecha</th><th>Tarifa</th><th class="text-end">Valor anterior</th><th class="text-end">Valor nuevo</th><th class="text-end">IVA ant.</th><th class="text-end">IVA nuevo</th><th>Usuario</th><th>Motivo</th></tr></thead>
        <tbody>
          <tr *ngIf="log.length === 0"><td colspan="8" class="text-center text-muted">Sin cambios registrados</td></tr>
          <tr *ngFor="let l of log"><td>{{ l.fecha | date:'yyyy-MM-dd HH:mm' }}</td><td>{{ l.codigo }} – {{ l.nombre }}</td><td class="text-end">{{ l.valorAnterior | currency:'COP':'symbol-narrow':'1.0-0' }}</td><td class="text-end">{{ l.valorNuevo | currency:'COP':'symbol-narrow':'1.0-0' }}</td><td class="text-end">{{ l.ivaAnterior }}</td><td class="text-end">{{ l.ivaNuevo }}</td><td>{{ l.usuario }}</td><td>{{ l.motivo }}</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<div *ngIf="ft" class="modal d-block" style="background:rgba(0,0,0,.45)">
  <div class="modal-dialog"><div class="modal-content">
    <div class="modal-header"><h5 class="modal-title">{{ ft.id ? 'Editar' : 'Nueva' }} tarifa</h5><button class="btn-close" (click)="ft = null"></button></div>
    <div class="modal-body"><div class="row g-3">
      <div class="col-4"><label class="form-label">Código *</label><input class="form-control" [(ngModel)]="ft.codigo" /></div>
      <div class="col-8"><label class="form-label">Nombre *</label><input class="form-control" [(ngModel)]="ft.nombre" /></div>
      <div class="col-6"><label class="form-label">Tipo *</label><select class="form-select" [(ngModel)]="ft.tipo"><option value="CONSULTA">Consulta</option><option value="PROCEDIMIENTO">Procedimiento</option><option value="SERVICIO">Servicio</option></select></div>
      <div class="col-6"><label class="form-label">Especialidad</label><select class="form-select" [(ngModel)]="ft.especializacionId"><option [ngValue]="null">General (todas)</option><option *ngFor="let e of activasEsp()" [ngValue]="e.id">{{ e.nombre }}</option></select></div>
      <div class="col-6"><label class="form-label">Valor *</label><input type="number" min="0" class="form-control" [(ngModel)]="ft.valor" /></div>
      <div class="col-6"><label class="form-label">IVA %</label><input type="number" min="0" max="100" class="form-control" [(ngModel)]="ft.ivaPorcentaje" /></div>
      <div class="col-12" *ngIf="ft.id"><label class="form-label">Motivo del cambio</label><input class="form-control" [(ngModel)]="ft.motivo" /></div>
    </div></div>
    <div class="modal-footer"><button class="btn btn-secondary" (click)="ft = null">Cancelar</button><button class="btn btn-primary" (click)="guardarTarifa()">Guardar</button></div>
  </div></div>
</div>

<div *ngIf="fe" class="modal d-block" style="background:rgba(0,0,0,.45)">
  <div class="modal-dialog"><div class="modal-content">
    <div class="modal-header"><h5 class="modal-title">{{ fe.id ? 'Editar' : 'Nueva' }} especialidad</h5><button class="btn-close" (click)="fe = null"></button></div>
    <div class="modal-body"><div class="row g-3">
      <div class="col-4"><label class="form-label">Código *</label><input class="form-control" maxlength="10" [(ngModel)]="fe.codigoEspecializacion" /></div>
      <div class="col-8"><label class="form-label">Nombre *</label><input class="form-control" [(ngModel)]="fe.nombre" /></div>
      <div class="col-12"><label class="form-label">Descripción</label><input class="form-control" [(ngModel)]="fe.descripcion" /></div>
    </div></div>
    <div class="modal-footer"><button class="btn btn-secondary" (click)="fe = null">Cancelar</button><button class="btn btn-primary" (click)="guardarEsp()">Guardar</button></div>
  </div></div>
</div>
`,
})
export class TarifasComponent implements OnInit {
  admin = esAdmin();
  tab: 'tarifas' | 'esp' | 'log' = 'tarifas';
  tarifas: any[] = [];
  especialidades: any[] = [];
  log: any[] = [];
  fTipo = '';
  fEsp = '';
  fActivo = '';
  ft: any = null;
  fe: any = null;

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.cargarEsp();
    this.cargarTarifas();
  }

  activasEsp(): any[] {
    return this.especialidades.filter((e) => e.activo);
  }

  cargarTarifas(): void {
    this.api.get<any[]>('/catalogo/tarifas', { tipo: this.fTipo, especialidadId: this.fEsp, activo: this.fActivo }).subscribe({ next: (t) => (this.tarifas = t), error: (e) => this.api.error(e) });
  }

  cargarEsp(): void {
    this.api.get<any[]>('/catalogo/especialidades').subscribe({ next: (e) => (this.especialidades = e), error: (e) => this.api.error(e) });
  }

  cargarLog(): void {
    this.api.get<any[]>('/catalogo/tarifas-log').subscribe({ next: (l) => (this.log = l), error: (e) => this.api.error(e) });
  }

  nuevaTarifa(): void {
    this.ft = { tipo: 'SERVICIO', valor: 0, ivaPorcentaje: 0, especializacionId: null };
  }

  editarTarifa(t: any): void {
    this.ft = { ...t, motivo: '' };
  }

  guardarTarifa(): void {
    const f = this.ft;
    const req = f.id ? this.api.put(`/catalogo/tarifas/${f.id}`, f) : this.api.post('/catalogo/tarifas', f);
    req.subscribe({ next: () => { this.ft = null; this.api.ok('Tarifa guardada'); this.cargarTarifas(); }, error: (e) => this.api.error(e) });
  }

  estadoTarifa(t: any): void {
    this.api.patch(`/catalogo/tarifas/${t.id}/estado`, { activo: !t.activo }).subscribe({ next: () => this.cargarTarifas(), error: (e) => this.api.error(e) });
  }

  nuevaEsp(): void {
    this.fe = {};
  }

  editarEsp(e: any): void {
    this.fe = { ...e };
  }

  guardarEsp(): void {
    const f = this.fe;
    const req = f.id ? this.api.put(`/catalogo/especialidades/${f.id}`, f) : this.api.post('/catalogo/especialidades', f);
    req.subscribe({ next: () => { this.fe = null; this.api.ok('Especialidad guardada'); this.cargarEsp(); }, error: (e) => this.api.error(e) });
  }

  estadoEsp(e: any): void {
    this.api.patch(`/catalogo/especialidades/${e.id}/estado`, { activo: !e.activo }).subscribe({ next: () => this.cargarEsp(), error: (er) => this.api.error(er) });
  }
}
