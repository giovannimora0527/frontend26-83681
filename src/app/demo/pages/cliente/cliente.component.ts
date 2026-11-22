import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { esMedico } from 'src/app/utils/rol.util';

/** Gestión de clientes (propietarios de mascotas): consulta, registro, edición y activación. */
@Component({
  selector: 'app-cliente',
  imports: [CommonModule, FormsModule],
  template: `
<div class="container-fluid">
  <div class="card">
    <div class="card-header">
      <div class="row g-2 align-items-center">
        <div class="col-md-5"><input class="form-control" placeholder="Buscar por documento, nombre o teléfono" [(ngModel)]="q" (keyup.enter)="cargar()" /></div>
        <div class="col-md-3"><select class="form-select" [(ngModel)]="fActivo" (change)="cargar()"><option value="">Activos e inactivos</option><option value="true">Activos</option><option value="false">Inactivos</option></select></div>
        <div class="col-md-4 text-end">
          <button class="btn btn-outline-secondary me-2" (click)="cargar()"><i class="fa fa-search"></i> Buscar</button>
          <button class="btn btn-outline-primary" *ngIf="!soloLectura" (click)="nuevo()"><i class="fa fa-plus"></i> Nuevo cliente</button>
        </div>
      </div>
    </div>
    <div class="card-body table-responsive">
      <table class="table table-sm table-hover align-middle">
        <thead><tr><th>Documento</th><th>Nombre</th><th>Nacimiento</th><th>Género</th><th>Teléfono</th><th>Dirección</th><th class="text-center">Mascotas</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          <tr *ngIf="clientes.length === 0"><td colspan="9" class="text-center text-muted">No hay clientes para mostrar</td></tr>
          <tr *ngFor="let c of clientes" [class.table-secondary]="!c.activo">
            <td>{{ c.tipoDocumento }} {{ c.numeroDocumento }}</td>
            <td>{{ c.nombres }} {{ c.apellidos }}</td>
            <td>{{ c.fechaNacimiento | date:'yyyy-MM-dd' }}</td>
            <td>{{ c.genero }}</td>
            <td>{{ c.telefono }}</td>
            <td>{{ c.direccion }}</td>
            <td class="text-center">{{ c.mascotas }}</td>
            <td><span class="badge" [ngClass]="c.activo ? 'bg-success' : 'bg-secondary'">{{ c.activo ? 'Activo' : 'Inactivo' }}</span></td>
            <td class="text-nowrap">
              <ng-container *ngIf="!soloLectura">
                <button class="btn btn-sm btn-outline-primary me-1" title="Editar" (click)="editar(c)"><i class="fa fa-pen"></i></button>
                <button class="btn btn-sm" [ngClass]="c.activo ? 'btn-outline-danger' : 'btn-outline-success'" [title]="c.activo ? 'Inactivar' : 'Activar'" (click)="estado(c)"><i class="fa" [ngClass]="c.activo ? 'fa-ban' : 'fa-check'"></i></button>
              </ng-container>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<div *ngIf="f" class="modal d-block" style="background:rgba(0,0,0,.45)">
  <div class="modal-dialog modal-lg"><div class="modal-content">
    <div class="modal-header"><h5 class="modal-title">{{ f.id ? 'Editar' : 'Nuevo' }} cliente</h5><button class="btn-close" (click)="f = null"></button></div>
    <div class="modal-body"><div class="row g-3">
      <div class="col-md-3"><label class="form-label">Tipo de documento *</label>
        <select class="form-select" [(ngModel)]="f.tipoDocumento"><option value="CC">CC</option><option value="CE">CE</option><option value="TI">TI</option><option value="PA">Pasaporte</option><option value="NIT">NIT</option></select></div>
      <div class="col-md-5"><label class="form-label">Número de documento *</label><input class="form-control" maxlength="20" [(ngModel)]="f.numeroDocumento" /></div>
      <div class="col-md-4"><label class="form-label">Fecha de nacimiento *</label><input type="date" class="form-control" [(ngModel)]="f.fechaNacimiento" /></div>
      <div class="col-md-6"><label class="form-label">Nombres *</label><input class="form-control" maxlength="100" [(ngModel)]="f.nombres" /></div>
      <div class="col-md-6"><label class="form-label">Apellidos *</label><input class="form-control" maxlength="100" [(ngModel)]="f.apellidos" /></div>
      <div class="col-md-3"><label class="form-label">Género</label>
        <select class="form-select" [(ngModel)]="f.genero"><option [ngValue]="null">Sin indicar</option><option value="M">Masculino</option><option value="F">Femenino</option><option value="O">Otro</option></select></div>
      <div class="col-md-4"><label class="form-label">Teléfono</label><input class="form-control" maxlength="20" [(ngModel)]="f.telefono" /></div>
      <div class="col-md-5"><label class="form-label">Dirección</label><input class="form-control" [(ngModel)]="f.direccion" /></div>
    </div></div>
    <div class="modal-footer"><button class="btn btn-secondary" (click)="f = null">Cancelar</button><button class="btn btn-primary" (click)="guardar()">Guardar</button></div>
  </div></div>
</div>
`,
})
export class ClienteComponent implements OnInit {
  soloLectura = esMedico();
  clientes: any[] = [];
  q = '';
  fActivo = '';
  f: any = null;

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.api.get<any[]>('/cliente/gestion', { q: this.q, activo: this.fActivo }).subscribe({ next: (c) => (this.clientes = c), error: (e) => this.api.error(e) });
  }

  nuevo(): void {
    this.f = { tipoDocumento: 'CC', genero: null };
  }

  editar(c: any): void {
    this.f = { ...c, fechaNacimiento: String(c.fechaNacimiento ?? '').substring(0, 10) };
  }

  guardar(): void {
    const f = this.f;
    const req = f.id ? this.api.put(`/cliente/gestion/${f.id}`, f) : this.api.post('/cliente/gestion', f);
    req.subscribe({ next: () => { this.f = null; this.api.ok('Cliente guardado'); this.cargar(); }, error: (e) => this.api.error(e) });
  }

  async estado(c: any): Promise<void> {
    const accion = c.activo ? 'inactivar' : 'activar';
    if (!(await this.api.confirmar(`¿Desea ${accion} a ${c.nombres} ${c.apellidos}?`))) {
      return;
    }
    this.api.patch(`/cliente/gestion/${c.id}/estado`, { activo: !c.activo }).subscribe({ next: () => this.cargar(), error: (e) => this.api.error(e) });
  }
}
