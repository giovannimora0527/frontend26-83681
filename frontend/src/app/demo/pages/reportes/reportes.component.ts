import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';

/** Módulo 4 – Reportes financieros, de inventario y de gestión médica (vista previa, PDF y Excel). */
@Component({
  selector: 'app-reportes',
  imports: [CommonModule, FormsModule],
  template: `
<div class="container-fluid">
  <div class="card">
    <div class="card-header"><h5 class="mb-0">Reportes</h5></div>
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-4"><label class="form-label">Reporte</label>
          <select class="form-select" [(ngModel)]="clave" (change)="cambio()">
            <optgroup *ngFor="let g of grupos" [label]="g.nombre"><option *ngFor="let r of g.items" [value]="r.clave">{{ r.titulo }}</option></optgroup>
          </select></div>
        <ng-container *ngIf="actual()?.usaFechas">
          <div class="col-md-2"><label class="form-label">Desde</label><input type="date" class="form-control" [(ngModel)]="desde" /></div>
          <div class="col-md-2"><label class="form-label">Hasta</label><input type="date" class="form-control" [(ngModel)]="hasta" /></div>
        </ng-container>
        <div class="col-md-2" *ngIf="tieneFiltro('estado')"><label class="form-label">Estado</label><input class="form-control" [(ngModel)]="filtros['estado']" placeholder="Opcional" /></div>
        <div class="col-md-2" *ngIf="tieneFiltro('tipo')"><label class="form-label">Tipo</label><input class="form-control" [(ngModel)]="filtros['tipo']" placeholder="Opcional" /></div>
        <div class="col-md-2" *ngIf="tieneFiltro('medicoId')"><label class="form-label">Veterinario (id)</label><input type="number" class="form-control" [(ngModel)]="filtros['medicoId']" /></div>
      </div>
      <div class="mt-3">
        <button class="btn btn-primary me-2" (click)="previsualizar()"><i class="fa fa-eye"></i> Vista previa</button>
        <button class="btn btn-outline-danger me-2" (click)="exportar('pdf')"><i class="fa fa-file-pdf"></i> PDF</button>
        <button class="btn btn-outline-success" (click)="exportar('excel')"><i class="fa fa-file-excel"></i> Excel</button>
      </div>
    </div>
  </div>

  <div class="card" *ngIf="r">
    <div class="card-header">
      <h5 class="mb-0">{{ r.titulo }}</h5>
      <small class="text-muted">{{ r.filtros }} · Generado {{ r.generado }} por {{ r.usuario }} · {{ r.cantidadFilas }} registros</small>
    </div>
    <div class="card-body table-responsive" style="max-height:520px; overflow:auto">
      <table class="table table-sm table-hover">
        <thead class="table-light"><tr><th *ngFor="let c of r.columnas" [class.text-end]="c.type !== 'T'">{{ c.header }}</th></tr></thead>
        <tbody>
          <tr *ngIf="r.filas.length === 0"><td [attr.colspan]="r.columnas.length" class="text-center text-muted">Sin datos para los filtros seleccionados</td></tr>
          <tr *ngFor="let f of r.filas"><td *ngFor="let c of r.columnas" [class.text-end]="c.type !== 'T'">{{ c.type === 'M' ? (f[c.key] | currency:'COP':'symbol-narrow':'1.0-0') : f[c.key] }}</td></tr>
        </tbody>
        <tfoot *ngIf="tieneTotales()">
          <tr class="fw-bold table-light"><td *ngFor="let c of r.columnas; let i = index" [class.text-end]="c.type !== 'T'">
            {{ r.totales[c.key] !== undefined ? (c.type === 'M' ? (r.totales[c.key] | currency:'COP':'symbol-narrow':'1.0-0') : r.totales[c.key]) : (i === 0 ? 'TOTAL' : '') }}</td></tr>
        </tfoot>
      </table>
    </div>
  </div>
</div>
`,
})
export class ReportesComponent implements OnInit {
  catalogo: any[] = [];
  grupos: { nombre: string; items: any[] }[] = [];
  clave = 'facturacion';
  desde = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('en-CA');
  hasta = new Date().toLocaleDateString('en-CA');
  filtros: Record<string, any> = {};
  r: any = null;

  private readonly filtrosPorReporte: Record<string, string[]> = {
    facturacion: ['estado', 'medicoId'], ingresos: ['estado'], 'ingresos-por-servicio': ['tipo'], existencias: ['estado', 'tipo'],
    movimientos: ['tipo'], citas: ['medicoId'], atenciones: ['medicoId'], despachos: ['estado'],
  };

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any[]>('/reportes').subscribe({
      next: (c) => {
        this.catalogo = c;
        const nombres: Record<string, string> = { FINANCIERO: 'Financieros', INVENTARIO: 'Inventario', GESTION: 'Gestión médica' };
        this.grupos = ['FINANCIERO', 'INVENTARIO', 'GESTION'].map((g) => ({ nombre: nombres[g], items: c.filter((x) => x.grupo === g) }));
      },
      error: (e) => this.api.error(e),
    });
  }

  actual(): any {
    return this.catalogo.find((c) => c.clave === this.clave);
  }

  tieneFiltro(f: string): boolean {
    return (this.filtrosPorReporte[this.clave] ?? []).includes(f);
  }

  tieneTotales(): boolean {
    return this.r && Object.keys(this.r.totales ?? {}).length > 0;
  }

  cambio(): void {
    this.r = null;
    this.filtros = {};
  }

  private params(): Record<string, unknown> {
    const p: Record<string, unknown> = { ...this.filtros };
    if (this.actual()?.usaFechas) {
      p['desde'] = this.desde;
      p['hasta'] = this.hasta;
    }
    return p;
  }

  previsualizar(): void {
    this.api.get<any>(`/reportes/${this.clave}`, this.params()).subscribe({ next: (r) => (this.r = r), error: (e) => this.api.error(e) });
  }

  exportar(formato: 'pdf' | 'excel'): void {
    this.api.descargar(`/reportes/${this.clave}/${formato}`, `reporte-${this.clave}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`, this.params(), formato === 'pdf');
  }
}
