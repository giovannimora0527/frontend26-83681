import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { esAdmin } from 'src/app/utils/rol.util';

/** Módulo 1 – Inventario de medicamentos y productos: existencias, alertas, lotes y kárdex. */
@Component({
  selector: 'app-inventario',
  imports: [CommonModule, FormsModule],
  template: `
<div class="container-fluid">
  <div class="row g-3 mb-3" *ngIf="resumen">
    <div class="col-6 col-md-3"><div class="card border-start border-danger border-4 mb-0"><div class="card-body py-2"><small class="text-muted">Agotados</small><h4 class="mb-0">{{ resumen.agotados }}</h4></div></div></div>
    <div class="col-6 col-md-3"><div class="card border-start border-warning border-4 mb-0"><div class="card-body py-2"><small class="text-muted">Stock bajo</small><h4 class="mb-0">{{ resumen.stockBajo }}</h4></div></div></div>
    <div class="col-6 col-md-3"><div class="card border-start border-info border-4 mb-0"><div class="card-body py-2"><small class="text-muted">Por vencer ({{ resumen.diasPorVencer }} días)</small><h4 class="mb-0">{{ resumen.porVencer }}</h4></div></div></div>
    <div class="col-6 col-md-3"><div class="card border-start border-dark border-4 mb-0"><div class="card-body py-2"><small class="text-muted">Con lotes vencidos</small><h4 class="mb-0">{{ resumen.vencidos }}</h4></div></div></div>
  </div>

  <div class="card">
    <div class="card-header">
      <div class="row g-2 align-items-center">
        <div class="col-md-4"><input class="form-control" placeholder="Buscar por código o nombre" [(ngModel)]="q" (keyup.enter)="listar()" /></div>
        <div class="col-md-2">
          <select class="form-select" [(ngModel)]="tipo" (change)="listar()">
            <option value="">Todos los tipos</option><option value="MEDICAMENTO">Medicamentos</option><option value="PRODUCTO">Productos / utensilios</option>
          </select>
        </div>
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="estado" (change)="listar()">
            <option value="">Todos los estados</option><option value="AGOTADO">Agotado</option><option value="STOCK_BAJO">Stock bajo</option>
            <option value="POR_VENCER">Por vencer</option><option value="VENCIDO">Con lotes vencidos</option>
          </select>
        </div>
        <div class="col-md-3 text-end">
          <button class="btn btn-outline-secondary me-2" (click)="listar()"><i class="fa fa-search"></i></button>
          <button class="btn btn-outline-primary" *ngIf="admin" (click)="nuevo()"><i class="fa fa-plus"></i> Nuevo</button>
        </div>
      </div>
    </div>
    <div class="card-body table-responsive">
      <table class="table table-sm table-hover align-middle">
        <thead><tr>
          <th>Código</th><th>Nombre</th><th>Tipo</th><th>Invima</th><th class="text-end">Stock</th><th class="text-end">Mín.</th>
          <th class="text-end">P. compra</th><th class="text-end">P. venta</th><th>Próx. vence</th><th>Próx. pedido</th><th>Estado</th><th class="text-center">Acciones</th>
        </tr></thead>
        <tbody>
          <tr *ngIf="lista.length === 0"><td colspan="12" class="text-center text-muted">Sin resultados</td></tr>
          <tr *ngFor="let m of lista" [class.table-secondary]="!m.activo">
            <td><code>{{ m.codigo }}</code></td>
            <td>{{ m.nombre }}<br /><small class="text-muted">{{ m.presentacion }}</small></td>
            <td>{{ m.tipo === 'MEDICAMENTO' ? 'Medicamento' : 'Producto' }}</td>
            <td>{{ m.registroInvima || '—' }}</td>
            <td class="text-end fw-bold">{{ m.stockActual }}</td>
            <td class="text-end">{{ m.stockMinimo }}</td>
            <td class="text-end">{{ m.precioCompra | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
            <td class="text-end">{{ m.precioVenta | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
            <td>{{ m.proximaFechaVence }}<span *ngIf="!m.proximaFechaVence && m.vencido" class="text-danger">Vencido</span><span *ngIf="!m.proximaFechaVence && !m.vencido">—</span></td>
            <td>{{ m.fechaProximoPedido || '—' }}</td>
            <td>
              <span class="badge bg-danger me-1" *ngIf="m.agotado">Agotado</span>
              <span class="badge bg-warning text-dark me-1" *ngIf="m.stockBajo && !m.agotado">Stock bajo</span>
              <span class="badge bg-info text-dark me-1" *ngIf="m.porVencer">Por vencer</span>
              <span class="badge bg-dark me-1" *ngIf="m.vencido">Vencido</span>
              <span class="badge bg-secondary" *ngIf="!m.activo">Inactivo</span>
              <span class="badge bg-success" *ngIf="m.activo && !m.agotado && !m.stockBajo && !m.porVencer && !m.vencido">Disponible</span>
            </td>
            <td class="text-center text-nowrap">
              <button class="btn btn-sm btn-outline-info me-1" title="Lotes y kárdex" (click)="verDetalle(m)"><i class="fa fa-list"></i></button>
              <button class="btn btn-sm btn-outline-success me-1" title="Registrar entrada" *ngIf="admin" (click)="abrirEntrada(m)"><i class="fa fa-box-open"></i></button>
              <button class="btn btn-sm btn-outline-primary me-1" title="Editar" *ngIf="admin" (click)="editar(m)"><i class="fa fa-pen"></i></button>
              <button class="btn btn-sm" [ngClass]="m.activo ? 'btn-outline-danger' : 'btn-outline-success'" *ngIf="admin" (click)="alternarEstado(m)"
                [title]="m.activo ? 'Inactivar' : 'Activar'"><i class="fa" [ngClass]="m.activo ? 'fa-ban' : 'fa-check'"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- Formulario -->
<div *ngIf="form" class="modal d-block" style="background:rgba(0,0,0,.45)">
  <div class="modal-dialog modal-lg"><div class="modal-content">
    <div class="modal-header"><h5 class="modal-title">{{ form.id ? 'Editar' : 'Nuevo' }} medicamento / producto</h5><button class="btn-close" (click)="form = null"></button></div>
    <div class="modal-body"><div class="row g-3">
      <div class="col-md-3"><label class="form-label">Código (8 caract.)</label><input class="form-control" maxlength="8" [(ngModel)]="form.codigo" placeholder="Automático si se deja vacío" /></div>
      <div class="col-md-5"><label class="form-label">Nombre *</label><input class="form-control" [(ngModel)]="form.nombre" /></div>
      <div class="col-md-4"><label class="form-label">Tipo *</label>
        <select class="form-select" [(ngModel)]="form.tipo" (change)="form.requiereInvima = form.tipo === 'MEDICAMENTO'">
          <option value="MEDICAMENTO">Medicamento</option><option value="PRODUCTO">Producto / utensilio</option></select></div>
      <div class="col-md-6"><label class="form-label">Presentación</label><input class="form-control" [(ngModel)]="form.presentacion" /></div>
      <div class="col-md-6"><label class="form-label">Descripción</label><input class="form-control" [(ngModel)]="form.descripcion" /></div>
      <div class="col-md-4"><label class="form-label">Registro Invima {{ form.tipo === 'MEDICAMENTO' || form.requiereInvima ? '*' : '(opcional)' }}</label><input class="form-control" [(ngModel)]="form.registroInvima" /></div>
      <div class="col-md-2 d-flex align-items-end"><div class="form-check"><input type="checkbox" class="form-check-input" id="inv" [(ngModel)]="form.requiereInvima" [disabled]="form.tipo === 'MEDICAMENTO'" /><label for="inv" class="form-check-label">Exige Invima</label></div></div>
      <div class="col-md-2"><label class="form-label">P. compra *</label><input type="number" min="0" class="form-control" [(ngModel)]="form.precioCompra" /></div>
      <div class="col-md-2"><label class="form-label">P. venta *</label><input type="number" min="0" class="form-control" [(ngModel)]="form.precioVenta" /></div>
      <div class="col-md-2"><label class="form-label">IVA %</label><input type="number" min="0" max="100" class="form-control" [(ngModel)]="form.ivaPorcentaje" /></div>
      <div class="col-md-3"><label class="form-label">Stock mínimo *</label><input type="number" min="0" class="form-control" [(ngModel)]="form.stockMinimo" /></div>
      <div class="col-md-4"><label class="form-label">Fecha próximo pedido</label><input type="date" class="form-control" [(ngModel)]="form.fechaProximoPedido" /></div>
      <ng-container *ngIf="!form.id">
        <div class="col-12"><hr class="my-1" /><small class="text-muted">Existencia inicial (opcional): crea el primer lote</small></div>
        <div class="col-md-3"><label class="form-label">Cantidad inicial</label><input type="number" min="0" class="form-control" [(ngModel)]="form.cantidadInicial" /></div>
        <div class="col-md-3"><label class="form-label">N.º de lote</label><input class="form-control" [(ngModel)]="form.numeroLote" /></div>
        <div class="col-md-3"><label class="form-label">Fecha de ingreso</label><input type="date" class="form-control" [(ngModel)]="form.fechaIngreso" /></div>
        <div class="col-md-3"><label class="form-label">Vencimiento</label><input type="date" class="form-control" [(ngModel)]="form.fechaVencimiento" /></div>
      </ng-container>
      <ng-container *ngIf="form.id">
        <div class="col-12"><hr class="my-1" /><small class="text-muted">El vencimiento se registra por lote (un mismo producto puede tener lotes con distintas fechas)</small></div>
        <div class="col-md-3"><label class="form-label">Stock actual</label><input class="form-control" disabled [value]="form.stockActual ?? 0" /></div>
        <div class="col-md-3"><label class="form-label">Próximo vencimiento</label><input class="form-control" disabled [value]="form.proximaFechaVence || 'Sin lotes con vencimiento'" /></div>
        <div class="col-md-6 d-flex align-items-end gap-2">
          <button type="button" class="btn btn-outline-info" (click)="irALotes(form)"><i class="fa fa-list"></i> Ver lotes y vencimientos</button>
          <button type="button" class="btn btn-outline-success" (click)="irAEntrada(form)"><i class="fa fa-box-open"></i> Registrar lote</button>
        </div>
      </ng-container>
    </div></div>
    <div class="modal-footer"><button class="btn btn-secondary" (click)="form = null">Cancelar</button><button class="btn btn-primary" (click)="guardar()">Guardar</button></div>
  </div></div>
</div>

<!-- Entrada de lote -->
<div *ngIf="entrada" class="modal d-block" style="background:rgba(0,0,0,.45)">
  <div class="modal-dialog"><div class="modal-content">
    <div class="modal-header"><h5 class="modal-title">Entrada de inventario – {{ entrada.nombre }}</h5><button class="btn-close" (click)="entrada = null"></button></div>
    <div class="modal-body"><div class="row g-3">
      <div class="col-6"><label class="form-label">N.º de lote *</label><input class="form-control" [(ngModel)]="entrada.numeroLote" /></div>
      <div class="col-6"><label class="form-label">Cantidad *</label><input type="number" min="1" class="form-control" [(ngModel)]="entrada.cantidad" /></div>
      <div class="col-6"><label class="form-label">Fecha de ingreso *</label><input type="date" class="form-control" [(ngModel)]="entrada.fechaIngreso" /></div>
      <div class="col-6"><label class="form-label">Vencimiento {{ entrada.tipo === 'MEDICAMENTO' ? '*' : '' }}</label><input type="date" class="form-control" [(ngModel)]="entrada.fechaVencimiento" /></div>
      <div class="col-6"><label class="form-label">Precio de compra</label><input type="number" min="0" class="form-control" [(ngModel)]="entrada.precioCompra" /></div>
    </div></div>
    <div class="modal-footer"><button class="btn btn-secondary" (click)="entrada = null">Cancelar</button><button class="btn btn-success" (click)="guardarEntrada()">Registrar entrada</button></div>
  </div></div>
</div>

<!-- Lotes y kárdex -->
<div *ngIf="detalle" class="modal d-block" style="background:rgba(0,0,0,.45)">
  <div class="modal-dialog modal-xl"><div class="modal-content">
    <div class="modal-header"><h5 class="modal-title">{{ detalle.nombre }} <small class="text-muted">({{ detalle.codigo }})</small></h5><button class="btn-close" (click)="detalle = null"></button></div>
    <div class="modal-body">
      <h6>Lotes</h6>
      <table class="table table-sm">
        <thead><tr><th>Lote</th><th>Ingreso</th><th>Vence</th><th class="text-end">Inicial</th><th class="text-end">Disponible</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          <tr *ngIf="lotes.length === 0"><td colspan="7" class="text-muted text-center">Sin lotes</td></tr>
          <tr *ngFor="let l of lotes" [class.table-danger]="l.vencido && l.cantidadDisponible > 0">
            <td>{{ l.numeroLote }}</td><td>{{ l.fechaIngreso }}</td><td>{{ l.fechaVencimiento || 'No vence' }}</td>
            <td class="text-end">{{ l.cantidadInicial }}</td><td class="text-end fw-bold">{{ l.cantidadDisponible }}</td>
            <td><span class="badge bg-dark" *ngIf="l.vencido">Vencido</span><span class="badge bg-info text-dark" *ngIf="l.porVencer">Por vencer</span></td>
            <td><button class="btn btn-sm btn-outline-danger" *ngIf="admin && l.cantidadDisponible > 0" (click)="baja(l)">Dar de baja</button></td>
          </tr>
        </tbody>
      </table>
      <h6 class="mt-3">Kárdex (entradas y salidas)</h6>
      <div class="table-responsive" style="max-height:300px; overflow:auto">
      <table class="table table-sm">
        <thead><tr><th>Fecha</th><th>Movimiento</th><th class="text-end">Cant.</th><th class="text-end">Saldo</th><th>Lote</th><th>Usuario</th><th>Referencia</th></tr></thead>
        <tbody>
          <tr *ngIf="movimientos.length === 0"><td colspan="7" class="text-muted text-center">Sin movimientos</td></tr>
          <tr *ngFor="let v of movimientos">
            <td>{{ v.fecha | date:'yyyy-MM-dd HH:mm' }}</td>
            <td><span class="badge" [ngClass]="{'bg-success': v.tipo==='ENTRADA' || v.tipo==='REVERSION', 'bg-danger': v.tipo==='SALIDA', 'bg-warning text-dark': v.tipo==='AJUSTE'}">{{ v.tipo }}</span></td>
            <td class="text-end">{{ v.cantidad }}</td><td class="text-end">{{ v.saldoPosterior }}</td><td>{{ v.numeroLote }}</td><td>{{ v.usuario }}</td>
            <td><small>{{ v.numeroComprobante ? 'Despacho ' + v.numeroComprobante : (v.cargaId ? 'Carga #' + v.cargaId : '') }} {{ v.nombreMascota ? ' · ' + v.nombreMascota : '' }} {{ v.observacion }}</small></td>
          </tr>
        </tbody>
      </table></div>
    </div>
  </div></div>
</div>
`,
})
export class InventarioComponent implements OnInit {
  admin = esAdmin();
  lista: any[] = [];
  resumen: any = null;
  q = '';
  tipo = '';
  estado = '';
  form: any = null;
  entrada: any = null;
  detalle: any = null;
  lotes: any[] = [];
  movimientos: any[] = [];

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.api.get<any[]>('/inventario/medicamentos', { q: this.q, tipo: this.tipo, estado: this.estado }).subscribe({
      next: (d) => (this.lista = d),
      error: (e) => this.api.error(e),
    });
    this.api.get<any>('/inventario/resumen').subscribe({ next: (r) => (this.resumen = r), error: () => undefined });
  }

  nuevo(): void {
    this.form = { tipo: 'MEDICAMENTO', requiereInvima: true, ivaPorcentaje: 0, stockMinimo: 0, precioCompra: 0, precioVenta: 0 };
  }

  editar(m: any): void {
    this.form = { ...m };
  }

  irALotes(m: any): void {
    this.form = null;
    this.verDetalle(m);
  }

  irAEntrada(m: any): void {
    this.form = null;
    this.abrirEntrada(m);
  }

  guardar(): void {
    const f = this.form;
    const req = f.id ? this.api.put(`/inventario/medicamentos/${f.id}`, f) : this.api.post('/inventario/medicamentos', f);
    req.subscribe({
      next: () => {
        this.form = null;
        this.api.ok('Guardado');
        this.listar();
      },
      error: (e) => this.api.error(e),
    });
  }

  async alternarEstado(m: any): Promise<void> {
    if (!(await this.api.confirmar(m.activo ? 'Inactivar' : 'Activar', `${m.nombre}`))) return;
    this.api.patch(`/inventario/medicamentos/${m.id}/estado`, { activo: !m.activo }).subscribe({ next: () => this.listar(), error: (e) => this.api.error(e) });
  }

  abrirEntrada(m: any): void {
    this.entrada = { id: m.id, nombre: m.nombre, tipo: m.tipo, precioCompra: m.precioCompra, fechaIngreso: new Date().toISOString().substring(0, 10) };
  }

  guardarEntrada(): void {
    this.api.post(`/inventario/medicamentos/${this.entrada.id}/entradas`, this.entrada).subscribe({
      next: () => {
        this.entrada = null;
        this.api.ok('Entrada registrada');
        this.listar();
      },
      error: (e) => this.api.error(e),
    });
  }

  verDetalle(m: any): void {
    this.detalle = m;
    this.cargarDetalle();
  }

  private cargarDetalle(): void {
    this.api.get<any[]>(`/inventario/medicamentos/${this.detalle.id}/lotes`).subscribe((l) => (this.lotes = l));
    this.api.get<any[]>(`/inventario/medicamentos/${this.detalle.id}/movimientos`).subscribe((v) => (this.movimientos = v));
  }

  async baja(l: any): Promise<void> {
    const motivo = await this.api.pedirTexto(`Baja del lote ${l.numeroLote} (${l.cantidadDisponible} unidades)`, 'Motivo de la baja');
    if (!motivo) return;
    this.api.post(`/inventario/lotes/${l.id}/baja`, { cantidad: l.cantidadDisponible, motivo }).subscribe({
      next: () => {
        this.cargarDetalle();
        this.listar();
      },
      error: (e) => this.api.error(e),
    });
  }
}
