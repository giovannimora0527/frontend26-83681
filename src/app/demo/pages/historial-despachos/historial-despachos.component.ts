import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ApiService } from 'src/app/services/api.service';

/** Historial de despachos con comprobante PDF y reversión autorizada por un administrador. */
@Component({
  selector: 'app-historial-despachos',
  imports: [CommonModule, FormsModule],
  template: `
<div class="container-fluid">
  <div class="card">
    <div class="card-header">
      <div class="row g-2">
        <div class="col-md-3"><input class="form-control" placeholder="Comprobante, mascota o propietario" [(ngModel)]="q" (keyup.enter)="listar()" /></div>
        <div class="col-md-2"><select class="form-select" [(ngModel)]="estado" (change)="listar()"><option value="">Todos</option><option value="DESPACHADO">Despachado</option><option value="DESPACHO_PARCIAL">Despacho parcial</option><option value="CANCELADO">Cancelado/revertido</option></select></div>
        <div class="col-md-2"><input type="date" class="form-control" [(ngModel)]="desde" /></div>
        <div class="col-md-2"><input type="date" class="form-control" [(ngModel)]="hasta" /></div>
        <div class="col-md-3"><button class="btn btn-outline-secondary" (click)="listar()"><i class="fa fa-search"></i> Filtrar</button></div>
      </div>
    </div>
    <div class="card-body table-responsive">
      <table class="table table-sm table-hover">
        <thead><tr><th>Comprobante</th><th>Fecha</th><th>Fórmula</th><th>Mascota</th><th>Propietario</th><th class="text-end">Unidades</th><th>Despachó</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          <tr *ngIf="lista.length === 0"><td colspan="9" class="text-center text-muted">Sin despachos</td></tr>
          <tr *ngFor="let d of lista">
            <td>{{ d.numeroComprobante || '#' + d.id }}</td><td>{{ d.fechaCreacion | date:'yyyy-MM-dd HH:mm' }}</td><td>#{{ d.formulaId }}</td><td>{{ d.nombreMascota }}</td><td>{{ d.propietario }}</td>
            <td class="text-end">{{ d.unidades }}</td><td>{{ d.usuario }}</td>
            <td><span class="badge" [ngClass]="d.revertido ? 'bg-secondary' : d.estado === 'DESPACHADO' ? 'bg-success' : 'bg-info text-dark'">{{ d.revertido ? 'Revertido' : d.estadoNombre }}</span></td>
            <td class="text-nowrap"><button class="btn btn-sm btn-outline-primary me-1" (click)="ver(d.id)"><i class="fa fa-eye"></i></button><button class="btn btn-sm btn-outline-secondary" (click)="pdf(d.id)"><i class="fa fa-file-pdf"></i></button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<div *ngIf="d" class="modal d-block" style="background:rgba(0,0,0,.45)">
  <div class="modal-dialog modal-lg"><div class="modal-content">
    <div class="modal-header"><h5 class="modal-title">Despacho {{ d.numeroComprobante || '#' + d.id }}</h5><button class="btn-close" (click)="d = null"></button></div>
    <div class="modal-body">
      <p class="small"><strong>Mascota:</strong> {{ d.nombreMascota }} · <strong>Propietario:</strong> {{ d.propietario }} · <strong>Despachó:</strong> {{ d.usuario }} · <strong>Estado:</strong> {{ d.estadoNombre }}</p>
      <table class="table table-sm">
        <thead><tr><th>Medicamento</th><th class="text-end">Solicitado</th><th class="text-end">Entregado</th><th>Lotes</th></tr></thead>
        <tbody><tr *ngFor="let i of d.items"><td>{{ i.medicamento }}</td><td class="text-end">{{ i.cantidadSolicitada }}</td><td class="text-end">{{ i.cantidadEntregada }}</td><td><small *ngFor="let l of i.lotes" class="d-block">{{ l.numeroLote }} (vence {{ l.fechaVencimiento || '—' }}): {{ l.cantidad }}</small></td></tr></tbody>
      </table>
      <div class="alert alert-secondary" *ngIf="d.reversion"><strong>Revertido</strong> el {{ d.reversion.fecha | date:'yyyy-MM-dd HH:mm' }} por {{ d.reversion.solicita }}, autorizado por {{ d.reversion.autoriza }}. Motivo: {{ d.reversion.motivo }}</div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline-danger me-auto" *ngIf="!d.reversion && (d.estado === 'DESPACHADO' || d.estado === 'DESPACHO_PARCIAL')" (click)="revertir()"><i class="fa fa-rotate-left"></i> Revertir (requiere autorización)</button>
      <button class="btn btn-outline-secondary" (click)="pdf(d.id)"><i class="fa fa-file-pdf"></i> Comprobante</button>
    </div>
  </div></div>
</div>
`,
})
export class HistorialDespachosComponent implements OnInit {
  lista: any[] = [];
  q = '';
  estado = '';
  desde = '';
  hasta = '';
  d: any = null;

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.api.get<any[]>('/despacho/historial', { q: this.q, estado: this.estado, desde: this.desde, hasta: this.hasta }).subscribe({ next: (l) => (this.lista = l), error: (e) => this.api.error(e) });
  }

  ver(id: number): void {
    this.api.get<any>(`/despacho/${id}`).subscribe({ next: (d) => (this.d = d), error: (e) => this.api.error(e) });
  }

  pdf(id: number): void {
    this.api.descargar(`/despacho/${id}/comprobante/pdf`, `comprobante-despacho-${id}.pdf`, undefined, true);
  }

  async revertir(): Promise<void> {
    const r = await Swal.fire({
      title: 'Reversión autorizada',
      html:
        '<p class="small text-start">Se devolverán las unidades a sus lotes. Requiere las credenciales de un <strong>administrador</strong>.</p>' +
        '<textarea id="rv-motivo" class="swal2-textarea" placeholder="Motivo (mín. 10 caracteres)"></textarea>' +
        '<input id="rv-user" class="swal2-input" placeholder="Usuario administrador">' +
        '<input id="rv-pass" type="password" class="swal2-input" placeholder="Contraseña del administrador">',
      showCancelButton: true,
      confirmButtonText: 'Revertir',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const v = (id: string) => (document.getElementById(id) as HTMLInputElement).value.trim();
        if (!v('rv-motivo') || !v('rv-user') || !v('rv-pass')) {
          Swal.showValidationMessage('Complete motivo, usuario y contraseña');
          return false;
        }
        return { motivo: v('rv-motivo'), adminUsername: v('rv-user'), adminPassword: (document.getElementById('rv-pass') as HTMLInputElement).value };
      },
    });
    if (!r.isConfirmed) return;
    this.api.post<any>(`/despacho/${this.d.id}/revertir`, r.value).subscribe({
      next: (d) => { this.d = d; this.api.ok('Despacho revertido'); this.listar(); },
      error: (e) => this.api.error(e),
    });
  }
}
