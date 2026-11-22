import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';

/** Módulo 5 – Despacho de fórmulas (perfil DESPACHO_MEDICO): FEFO, despacho parcial y comprobante. */
@Component({
  selector: 'app-despacho',
  imports: [CommonModule, FormsModule],
  template: `
<div class="container-fluid">
  <div class="card">
    <div class="card-header">
      <div class="row g-2">
        <div class="col-md-5"><input class="form-control" placeholder="Buscar por N.º fórmula, cita, mascota, propietario o documento" [(ngModel)]="q" (keyup.enter)="listar()" /></div>
        <div class="col-md-3"><select class="form-select" [(ngModel)]="estado" (change)="listar()">
          <option value="">Pendientes y en proceso</option><option value="PENDIENTE_DESPACHO">Pendiente de despacho</option><option value="EN_PREPARACION">En preparación</option>
          <option value="DESPACHO_PARCIAL">Despacho parcial</option><option value="PENDIENTE_DISPONIBILIDAD">Pendiente por disponibilidad</option><option value="DESPACHADO">Despachadas</option><option value="CANCELADO">Canceladas</option></select></div>
        <div class="col-md-4"><button class="btn btn-outline-secondary" (click)="listar()"><i class="fa fa-search"></i> Buscar</button></div>
      </div>
    </div>
    <div class="card-body table-responsive">
      <table class="table table-sm table-hover">
        <thead><tr><th>Fórmula</th><th>Confirmada</th><th>Mascota</th><th>Propietario</th><th>Médico</th><th class="text-end">Ítems</th><th class="text-end">Unid. pendientes</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          <tr *ngIf="lista.length === 0"><td colspan="9" class="text-center text-muted">No hay fórmulas</td></tr>
          <tr *ngFor="let f of lista">
            <td>#{{ f.id }}</td><td>{{ f.fechaConfirmacion | date:'yyyy-MM-dd HH:mm' }}</td><td>{{ f.nombreMascota }}</td><td>{{ f.propietario }}</td><td>{{ f.medico }}</td>
            <td class="text-end">{{ f.items }}</td><td class="text-end">{{ f.unidadesPendientes }}</td>
            <td><span class="badge" [ngClass]="clase(f.estadoDespacho)">{{ f.estadoDespachoNombre }}</span></td>
            <td><button class="btn btn-sm btn-primary" (click)="abrir(f.id)">Revisar</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<div *ngIf="f" class="modal d-block" style="background:rgba(0,0,0,.45)">
  <div class="modal-dialog modal-xl"><div class="modal-content">
    <div class="modal-header"><h5 class="modal-title">Fórmula #{{ f.id }} — {{ f.nombreMascota }} <span class="badge ms-2" [ngClass]="clase(f.estadoDespacho)">{{ f.estadoDespachoNombre }}</span></h5><button class="btn-close" (click)="f = null"></button></div>
    <div class="modal-body">
      <p class="small mb-2"><strong>Propietario:</strong> {{ f.propietario }} ({{ f.propietarioDocumento }}) · <strong>Prescribe:</strong> {{ f.medico }}</p>
      <table class="table table-sm align-middle">
        <thead><tr><th>Medicamento</th><th>Posología</th><th class="text-end">Prescrito</th><th class="text-end">Dispensado</th><th class="text-end">Pendiente</th><th class="text-end">Stock vigente</th><th>Lotes (FEFO)</th><th style="width:110px">A despachar</th></tr></thead>
        <tbody>
          <tr *ngFor="let i of f.items" [class.table-warning]="i.alerta && i.cantidadPendiente > 0">
            <td><strong>{{ i.medicamento }}</strong><br /><small class="text-muted">{{ i.codigo }}</small></td>
            <td><small>{{ i.dosis }} {{ i.frecuencia }} {{ i.duracionDias ? 'por ' + i.duracionDias + ' d' : '' }} {{ i.viaAdministracion }}<br />{{ i.indicaciones }}</small></td>
            <td class="text-end">{{ i.cantidadPrescrita }}</td><td class="text-end">{{ i.cantidadDispensada }}</td><td class="text-end fw-bold">{{ i.cantidadPendiente }}</td>
            <td class="text-end">{{ i.disponible }}<div class="small text-danger" *ngIf="i.alerta">{{ i.alerta }}</div></td>
            <td><div class="small" *ngFor="let l of i.lotesPropuestos">{{ l.numeroLote }} · vence {{ l.fechaVencimiento || '—' }} · <strong>{{ l.cantidad }}</strong></div></td>
            <td><input type="number" min="0" [max]="i.puedeDespachar" class="form-control form-control-sm" [(ngModel)]="cant[i.id]" [disabled]="i.cantidadPendiente === 0 || !puedeOperar()" /></td>
          </tr>
        </tbody>
      </table>
      <div class="mb-2"><input class="form-control form-control-sm" placeholder="Observaciones del despacho (opcional)" [(ngModel)]="obs" /></div>
      <h6 class="mt-3">Cambios de estado</h6>
      <ul class="small mb-0"><li *ngFor="let l of f.log">{{ l.fecha | date:'yyyy-MM-dd HH:mm' }} · {{ l.estadoAnterior || '—' }} → <strong>{{ l.estadoNuevo }}</strong> · {{ l.usuario }} · {{ l.observacion }}</li></ul>
      <div class="mt-2" *ngIf="f.despachos.length"><strong>Despachos:</strong> <button class="btn btn-sm btn-outline-secondary ms-1" *ngFor="let d of f.despachos" (click)="comprobante(d.id)">{{ d.numeroComprobante || ('#' + d.id) }} ({{ d.estado }})</button></div>
    </div>
    <div class="modal-footer" *ngIf="puedeOperar()">
      <button class="btn btn-outline-danger me-auto" *ngIf="f.estadoDespacho !== 'DESPACHO_PARCIAL'" (click)="cancelar()">Cancelar despacho</button>
      <button class="btn btn-outline-primary" *ngIf="f.estadoDespacho !== 'EN_PREPARACION'" (click)="preparar()">Iniciar preparación</button>
      <button class="btn btn-success" (click)="confirmar()"><i class="fa fa-check"></i> Confirmar despacho</button>
    </div>
  </div></div>
</div>
`,
})
export class DespachoComponent implements OnInit {
  lista: any[] = [];
  q = '';
  estado = '';
  f: any = null;
  cant: Record<number, number> = {};
  obs = '';

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.listar();
  }

  clase(e: string): string {
    return { PENDIENTE_DESPACHO: 'bg-warning text-dark', EN_PREPARACION: 'bg-primary', DESPACHO_PARCIAL: 'bg-info text-dark', DESPACHADO: 'bg-success', PENDIENTE_DISPONIBILIDAD: 'bg-danger', CANCELADO: 'bg-secondary' }[e] ?? 'bg-secondary';
  }

  puedeOperar(): boolean {
    return !!this.f && ['PENDIENTE_DESPACHO', 'EN_PREPARACION', 'DESPACHO_PARCIAL', 'PENDIENTE_DISPONIBILIDAD'].includes(this.f.estadoDespacho);
  }

  listar(): void {
    this.api.get<any[]>('/despacho/formulas', { q: this.q, estado: this.estado }).subscribe({ next: (l) => (this.lista = l), error: (e) => this.api.error(e) });
  }

  abrir(id: number): void {
    this.api.get<any>(`/despacho/formulas/${id}`).subscribe({ next: (f) => this.asignar(f), error: (e) => this.api.error(e) });
  }

  private asignar(f: any): void {
    this.f = f;
    this.cant = {};
    f.items.forEach((i: any) => (this.cant[i.id] = i.puedeDespachar));
    this.obs = '';
  }

  preparar(): void {
    this.api.post<any>(`/despacho/formulas/${this.f.id}/preparar`).subscribe({ next: (f) => { this.asignar(f); this.listar(); }, error: (e) => this.api.error(e) });
  }

  async cancelar(): Promise<void> {
    const motivo = await this.api.pedirTexto('Cancelar despacho de la fórmula', 'Motivo');
    if (!motivo) return;
    this.api.post<any>(`/despacho/formulas/${this.f.id}/cancelar`, { motivo }).subscribe({ next: () => { this.f = null; this.listar(); this.api.ok('Despacho cancelado'); }, error: (e) => this.api.error(e) });
  }

  async confirmar(): Promise<void> {
    const items = this.f.items.map((i: any) => ({ formulaDetalleId: i.id, cantidad: Number(this.cant[i.id] ?? 0) }));
    const total = items.reduce((s: number, i: any) => s + i.cantidad, 0);
    if (total === 0) {
      // Nada que despachar: el backend deja la fórmula pendiente por disponibilidad
      if (!(await this.api.confirmar('Sin unidades a despachar', 'La fórmula quedará «Pendiente por disponibilidad».'))) return;
    } else if (!(await this.api.confirmar('Confirmar despacho', `Se descontarán ${total} unidades del inventario (lotes por vencimiento FEFO).`))) return;
    this.api.post<any>(`/despacho/formulas/${this.f.id}/confirmar`, { observaciones: this.obs, items }).subscribe({
      next: (r) => {
        this.f = null;
        this.listar();
        if (r.id && r.numeroComprobante) {
          this.api.ok(`Despacho ${r.numeroComprobante} registrado`);
          this.comprobante(r.id);
        } else {
          this.api.ok(r.mensaje || 'Estado actualizado');
        }
      },
      error: (e) => this.api.error(e),
    });
  }

  comprobante(id: number): void {
    this.api.descargar(`/despacho/${id}/comprobante/pdf`, `comprobante-despacho-${id}.pdf`, undefined, true);
  }
}
