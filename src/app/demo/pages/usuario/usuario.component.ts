import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';

/** Gestión de usuarios del sistema y asignación de perfiles (solo ADMINISTRADOR). */
@Component({
  selector: 'app-usuario',
  imports: [CommonModule, FormsModule],
  template: `
<div class="container-fluid">
  <div class="card">
    <div class="card-header">
      <div class="row g-2 align-items-center">
        <div class="col-md-6"><input class="form-control" placeholder="Buscar por usuario, correo o perfil" [(ngModel)]="q" (keyup.enter)="cargar()" /></div>
        <div class="col-md-6 text-end">
          <button class="btn btn-outline-secondary me-2" (click)="cargar()"><i class="fa fa-search"></i> Buscar</button>
          <button class="btn btn-outline-primary" (click)="nuevo()"><i class="fa fa-plus"></i> Nuevo usuario</button>
        </div>
      </div>
    </div>
    <div class="card-body table-responsive">
      <table class="table table-sm table-hover align-middle">
        <thead><tr><th>Usuario</th><th>Correo</th><th>Perfil</th><th>Creado</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let u of usuarios" [class.table-secondary]="!u.activo">
            <td>{{ u.username }} <span class="badge bg-info" *ngIf="u.esMedico">Veterinario</span></td>
            <td>{{ u.email }}</td>
            <td>{{ u.perfil }}</td>
            <td>{{ u.fechaCreacion | date:'yyyy-MM-dd HH:mm' }}</td>
            <td><span class="badge" [ngClass]="u.activo ? 'bg-success' : 'bg-secondary'">{{ u.activo ? 'Activo' : 'Inactivo' }}</span></td>
            <td class="text-nowrap">
              <button class="btn btn-sm btn-outline-primary me-1" title="Editar" (click)="editar(u)"><i class="fa fa-pen"></i></button>
              <button class="btn btn-sm" [ngClass]="u.activo ? 'btn-outline-danger' : 'btn-outline-success'" [title]="u.activo ? 'Inactivar' : 'Activar'" (click)="estado(u)"><i class="fa" [ngClass]="u.activo ? 'fa-ban' : 'fa-check'"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<div *ngIf="f" class="modal d-block" style="background:rgba(0,0,0,.45)">
  <div class="modal-dialog"><div class="modal-content">
    <div class="modal-header"><h5 class="modal-title">{{ f.id ? 'Editar' : 'Nuevo' }} usuario</h5><button class="btn-close" (click)="f = null"></button></div>
    <div class="modal-body"><div class="row g-3">
      <div class="col-12"><label class="form-label">Usuario *</label><input class="form-control" maxlength="50" [(ngModel)]="f.username" /></div>
      <div class="col-12"><label class="form-label">Correo electrónico *</label><input type="email" class="form-control" [(ngModel)]="f.email" /></div>
      <div class="col-12"><label class="form-label">Perfil *</label>
        <select class="form-select" [(ngModel)]="f.perfilId"><option [ngValue]="null">Seleccione…</option><option *ngFor="let p of perfiles" [ngValue]="p.id">{{ p.nombre }}</option></select></div>
      <div class="col-12"><label class="form-label">Contraseña {{ f.id ? '(dejar vacío para no cambiarla)' : '*' }}</label><input type="password" class="form-control" autocomplete="new-password" [(ngModel)]="f.password" /><div class="form-text">Mínimo 8 caracteres.</div></div>
    </div></div>
    <div class="modal-footer"><button class="btn btn-secondary" (click)="f = null">Cancelar</button><button class="btn btn-primary" (click)="guardar()">Guardar</button></div>
  </div></div>
</div>
`,
})
export class UsuarioComponent implements OnInit {
  usuarios: any[] = [];
  perfiles: any[] = [];
  q = '';
  f: any = null;

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any[]>('/usuario/gestion/perfiles').subscribe({ next: (p) => (this.perfiles = p), error: (e) => this.api.error(e) });
    this.cargar();
  }

  cargar(): void {
    this.api.get<any[]>('/usuario/gestion', { q: this.q }).subscribe({ next: (u) => (this.usuarios = u), error: (e) => this.api.error(e) });
  }

  nuevo(): void {
    this.f = { perfilId: null, password: '' };
  }

  editar(u: any): void {
    this.f = { id: u.id, username: u.username, email: u.email, perfilId: u.perfilId, password: '' };
  }

  guardar(): void {
    const f = this.f;
    const req = f.id ? this.api.put(`/usuario/gestion/${f.id}`, f) : this.api.post('/usuario/gestion', f);
    req.subscribe({ next: () => { this.f = null; this.api.ok('Usuario guardado'); this.cargar(); }, error: (e) => this.api.error(e) });
  }

  async estado(u: any): Promise<void> {
    const accion = u.activo ? 'inactivar' : 'activar';
    if (!(await this.api.confirmar(`¿Desea ${accion} al usuario ${u.username}?`))) {
      return;
    }
    this.api.patch(`/usuario/gestion/${u.id}/estado`, { activo: !u.activo }).subscribe({ next: () => this.cargar(), error: (e) => this.api.error(e) });
  }
}
