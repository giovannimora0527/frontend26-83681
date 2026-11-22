import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { esAdmin } from 'src/app/utils/rol.util';

/** Facturación: pendientes de facturar, historial, pagos, anulación y PDF. */
@Component({
  selector: 'app-facturas',
  imports: [CommonModule, FormsModule],
  template: `
<div class="container-fluid">
  <ul class="nav nav-tabs mb-3">
    <li class="nav-item"><a class="nav-link" [class.active]="tab==='pend'" role="button" (click)="tab='pend'">Pendientes de facturar ({{ pendientes.length }})</a></li>
    <li class="nav-item"><a class="nav-link" [class.active]="tab==='hist'" role="button" (click)="tab='hist'">Historial de facturación</a></li>
  </ul>

  <div class="card" *ngIf="tab==='pend'">
    <div class="card-body table-responsive">
      <table class="table table-sm table-hover">
        <thead><tr><th>Cita</th><th>Fecha</th><th>Mascota</th><th>Propietario</th><th>Veterinario</th><th>Fórmula</th><th></th></tr></thead>
        <tbody>
          <tr *ngIf="pendientes.length === 0"><td colspan="7" class="text-center text-muted">No hay citas atendidas pendientes de facturar</td></tr>
          <tr *ngFor="let p of pendientes">
            <td>#{{ p.citaId }}</td><td>{{ p.fecha | date:'yyyy-MM-dd HH:mm' }}</td><td>{{ p.nombreMascota }}</td><td>{{ p.propietario }}</td><td>{{ p.medico }}</td>
            <td><span *ngIf="!p.formulaId" class="text-muted">Sin fórmula</span><span *ngIf="p.formulaId" class="badge" [ngClass]="p.listoParaFacturar ? 'bg-success' : 'bg-warning text-dark'">{{ p.estadoDespachoNombre }}</span></td>
            <td><button class="btn btn-sm btn-primary" [disabled]="!p.listoParaFacturar" [title]="p.listoParaFacturar ? '' : 'Debe despacharse la fórmula antes de facturar'" (click)="generar(p)">Generar factura</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="card" *ngIf="tab==='hist'">
    <div class="card-header">
      <div class="row g-2">
        <div class="col-md-3"><input class="form-control" placeholder="N.º, mascota o cliente" [(ngModel)]="fq" (keyup.enter)="cargarHistorial()" /></div>
        <div class="col-md-2"><select class="form-select" [(ngModel)]="fEstado" (change)="cargarHistorial()"><option value="">Todos los estados</option><option value="PENDIENTE_PAGO">Pendiente de pago</option><option value="PAGO_PARCIAL">Pago parcial</option><option value="PAGADA">Pagada</option><option value="ANULADA">Anulada</option></select></div>
        <div class="col-md-2"><input type="date" class="form-control" [(ngModel)]="fDesde" /></div>
        <div class="col-md-2"><input type="date" class="form-control" [(ngModel)]="fHasta" /></div>
        <div class="col-md-3"><button class="btn btn-outline-secondary" (click)="cargarHistorial()"><i class="fa fa-search"></i> Filtrar</button></div>
      </div>
    </div>
    <div class="card-body table-responsive">
      <table class="table table-sm table-hover">
        <thead><tr><th>N.º</th><th>Fecha</th><th>Cliente</th><th>Mascota</th><th class="text-end">Total</th><th class="text-end">Pagado</th><th class="text-end">Saldo</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          <tr *ngIf="facturas.length === 0"><td colspan="9" class="text-center text-muted">Sin facturas</td></tr>
          <tr *ngFor="let f of facturas" [class.table-secondary]="f.estado === 'ANULADA'">
            <td>{{ f.numero }}</td><td>{{ f.fechaGeneracion | date:'yyyy-MM-dd HH:mm' }}</td><td>{{ f.propietario }}</td><td>{{ f.nombreMascota }}</td>
            <td class="text-end">{{ f.total | currency:'COP':'symbol-narrow':'1.0-0' }}</td><td class="text-end">{{ f.totalPagado | currency:'COP':'symbol-narrow':'1.0-0' }}</td><td class="text-end">{{ f.saldo | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
            <td><span class="badge" [ngClass]="clase(f.estado)">{{ nombre(f.estado) }}</span></td>
            <td class="text-nowrap"><button class="btn btn-sm btn-outline-primary me-1" (click)="ver(f.id)"><i class="fa fa-eye"></i></button><button class="btn btn-sm btn-outline-secondary" (click)="pdf(f.id)"><i class="fa fa-file-pdf"></i></button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<div *ngIf="d" class="modal d-block" style="background:rgba(0,0,0,.45)">
  <div class="modal-dialog modal-lg"><div class="modal-content">
    <div class="modal-header"><h5 class="modal-title">Factura {{ d.numero }} <span class="badge" [ngClass]="clase(d.estado)">{{ nombre(d.estado) }}</span></h5><button class="btn-close" (click)="d = null"></button></div>
    <div class="modal-body">
      <div class="row g-1 mb-2 small">
        <div class="col-md-6"><strong>Cliente:</strong> {{ d.propietario }}</div><div class="col-md-6"><strong>Mascota:</strong> {{ d.nombreMascota }}</div>
        <div class="col-md-6"><strong>Veterinario:</strong> {{ d.medico }}</div><div class="col-md-6"><strong>Fecha:</strong> {{ d.fechaGeneracion | date:'yyyy-MM-dd HH:mm' }}</div>
      </div>
      <table class="table table-sm">
        <thead><tr><th>Tipo</th><th>Descripción</th><th class="text-end">Cant.</th><th class="text-end">Valor</th><th class="text-end">IVA</th><th class="text-end">Total</th></tr></thead>
        <tbody><tr *ngFor="let l of d.detalle"><td>{{ l.tipo }}</td><td>{{ l.descripcion }}</td><td class="text-end">{{ l.cantidad }}</td><td class="text-end">{{ l.valorUnitario | currency:'COP':'symbol-narrow':'1.0-0' }}</td><td class="text-end">{{ l.valorIva | currency:'COP':'symbol-narrow':'1.0-0' }}</td><td class="text-end">{{ l.total | currency:'COP':'symbol-narrow':'1.0-0' }}</td></tr></tbody>
        <tfoot>
          <tr><td colspan="5" class="text-end">Subtotal</td><td class="text-end">{{ d.subtotal | currency:'COP':'symbol-narrow':'1.0-0' }}</td></tr>
          <tr><td colspan="5" class="text-end">IVA</td><td class="text-end">{{ d.totalIva | currency:'COP':'symbol-narrow':'1.0-0' }}</td></tr>
          <tr *ngIf="d.descuento > 0"><td colspan="5" class="text-end">Descuento ({{ d.descuentoAutorizadoPor }})</td><td class="text-end">-{{ d.descuento | currency:'COP':'symbol-narrow':'1.0-0' }}</td></tr>
          <tr class="fw-bold"><td colspan="5" class="text-end">TOTAL</td><td class="text-end">{{ d.total | currency:'COP':'symbol-narrow':'1.0-0' }}</td></tr>
          <tr><td colspan="5" class="text-end">Pagado</td><td class="text-end">{{ d.totalPagado | currency:'COP':'symbol-narrow':'1.0-0' }}</td></tr>
          <tr class="fw-bold"><td colspan="5" class="text-end">Saldo</td><td class="text-end">{{ d.saldo | currency:'COP':'symbol-narrow':'1.0-0' }}</td></tr>
        </tfoot>
      </table>
      <div *ngIf="d.estado !== 'ANULADA' && d.estado !== 'PAGADA'" class="row g-2 align-items-end mb-3">
        <div class="col-md-3"><label class="form-label small">Monto</label><input type="number" min="1" class="form-control" [(ngModel)]="pago.monto" /></div>
        <div class="col-md-3"><label class="form-label small">Método</label><select class="form-select" [(ngModel)]="pago.metodo"><option>EFECTIVO</option><option>TARJETA</option><option>TRANSFERENCIA</option><option>OTRO</option></select></div>
        <div class="col-md-3"><label class="form-label small">Referencia</label><input class="form-control" [(ngModel)]="pago.referencia" /></div>
        <div class="col-md-3"><button class="btn btn-success w-100" (click)="pagar()">Registrar pago</button></div>
      </div>
      <h6>Pagos</h6>
      <table class="table table-sm"><tbody>
        <tr *ngIf="d.pagos.length === 0"><td class="text-muted">Sin pagos registrados</td></tr>
        <tr *ngFor="let p of d.pagos"><td>{{ p.fechaPago | date:'yyyy-MM-dd HH:mm' }}</td><td>{{ p.metodo }}</td><td class="text-end">{{ p.monto | currency:'COP':'symbol-narrow':'1.0-0' }}</td><td>{{ p.referencia }}</td><td>{{ p.usuario }}</td></tr>
      </tbody></table>
      <h6>Trazabilidad</h6>
      <ul class="small mb-0"><li *ngFor="let l of d.log">{{ l.fecha | date:'yyyy-MM-dd HH:mm' }} · <strong>{{ l.accion }}</strong> · {{ l.usuario }} · {{ l.detalle }}</li></ul>
      <div class="alert alert-danger mt-2 mb-0" *ngIf="d.estado === 'ANULADA'"><strong>Anulada:</strong> {{ d.motivoAnulacion }} ({{ d.usuarioAnula }})</div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline-danger me-auto" *ngIf="admin && d.estado !== 'ANULADA'" (click)="anular()">Anular factura</button>
      <button class="btn btn-outline-secondary" (click)="pdf(d.id)"><i class="fa fa-file-pdf"></i> PDF</button>
    </div>
  </div></div>
</div>
`,
})
export class FacturasComponent implements OnInit {
  admin = esAdmin();
  tab: 'pend' | 'hist' = 'pend';
  pendientes: any[] = [];
  facturas: any[] = [];
  d: any = null;
  fq = '';
  fEstado = '';
  fDesde = '';
  fHasta = '';
  pago: any = { monto: null, metodo: 'EFECTIVO', referencia: '' };

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.cargarPendientes();
    this.cargarHistorial();
  }

  clase(e: string): string {
    return { PENDIENTE_PAGO: 'bg-warning text-dark', PAGO_PARCIAL: 'bg-info text-dark', PAGADA: 'bg-success', ANULADA: 'bg-danger' }[e] ?? 'bg-secondary';
  }

  nombre(e: string): string {
    return { PENDIENTE_PAGO: 'Pendiente de pago', PAGO_PARCIAL: 'Pago parcial', PAGADA: 'Pagada', ANULADA: 'Anulada' }[e] ?? e;
  }

  cargarPendientes(): void {
    this.api.get<any[]>('/facturas/pendientes').subscribe({ next: (p) => (this.pendientes = p), error: (e) => this.api.error(e) });
  }

  cargarHistorial(): void {
    this.api.get<any[]>('/facturas', { q: this.fq, estado: this.fEstado, desde: this.fDesde, hasta: this.fHasta }).subscribe({ next: (f) => (this.facturas = f), error: (e) => this.api.error(e) });
  }

  async generar(p: any): Promise<void> {
    let descuento = 0;
    if (this.admin) {
      const r = await this.api.pedirTexto('Descuento (opcional)', 'Valor del descuento en pesos (0 si no aplica)');
      if (r === null) return;
      descuento = Number(r) || 0;
    } else if (!(await this.api.confirmar('Generar factura', `Cita #${p.citaId} – ${p.nombreMascota}`))) {
      return;
    }
    this.api.post<any>(`/facturas/cita/${p.citaId}`, { descuento }).subscribe({
      next: (f) => {
        this.api.ok(`Factura ${f.numero} generada`);
        this.cargarPendientes();
        this.cargarHistorial();
        this.d = f;
      },
      error: (e) => this.api.error(e),
    });
  }

  ver(id: number): void {
    this.api.get<any>(`/facturas/${id}`).subscribe({ next: (f) => { this.d = f; this.pago = { monto: f.saldo, metodo: 'EFECTIVO', referencia: '' }; }, error: (e) => this.api.error(e) });
  }

  pagar(): void {
    this.api.post<any>(`/facturas/${this.d.id}/pagos`, this.pago).subscribe({
      next: (f) => { this.d = f; this.pago = { monto: f.saldo, metodo: 'EFECTIVO', referencia: '' }; this.api.ok('Pago registrado'); this.cargarHistorial(); },
      error: (e) => this.api.error(e),
    });
  }

  async anular(): Promise<void> {
    const motivo = await this.api.pedirTexto(`Anular factura ${this.d.numero}`, 'Motivo de la anulación (mínimo 10 caracteres)');
    if (!motivo) return;
    this.api.post<any>(`/facturas/${this.d.id}/anular`, { motivo }).subscribe({
      next: (f) => { this.d = f; this.api.ok('Factura anulada'); this.cargarHistorial(); this.cargarPendientes(); },
      error: (e) => this.api.error(e),
    });
  }

  pdf(id: number): void {
    this.api.descargar(`/facturas/${id}/pdf`, `factura-${id}.pdf`, undefined, true);
  }
}
