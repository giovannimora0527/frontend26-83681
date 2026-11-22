import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';

/** Carga masiva de inventario (.xlsx / .csv): previsualización, validación por fila y confirmación. */
@Component({
  selector: 'app-carga-inventario',
  imports: [CommonModule],
  template: `
<div class="container-fluid">
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
      <h5 class="mb-0">Carga masiva de inventario</h5>
      <button class="btn btn-outline-secondary btn-sm" (click)="plantilla()"><i class="fa fa-download"></i> Descargar plantilla</button>
    </div>
    <div class="card-body">
      <p class="text-muted mb-2">Columnas requeridas: nombre, tipo (MEDICAMENTO/PRODUCTO), registro_invima (obligatorio en medicamentos), precio_compra, precio_venta, cantidad, stock_minimo, fecha_compra, fecha_vencimiento. Opcionales: codigo, descripcion, presentacion, iva_porcentaje, numero_lote, fecha_proximo_pedido. Se detectan duplicados dentro del archivo y contra la base de datos.</p>
      <div class="row g-2 align-items-center">
        <div class="col-md-6"><input type="file" class="form-control" accept=".xlsx,.csv" (change)="elegir($event)" /></div>
        <div class="col-md-6"><button class="btn btn-primary" [disabled]="!archivo || cargando" (click)="previsualizar()"><i class="fa fa-eye"></i> {{ cargando ? 'Procesando…' : 'Previsualizar y validar' }}</button></div>
      </div>
    </div>
  </div>

  <div class="card" *ngIf="prev">
    <div class="card-header">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <strong>{{ prev.archivo }}</strong> —
          <span class="badge bg-secondary">{{ prev.total }} registros</span>
          <span class="badge bg-success ms-1">{{ prev.validos }} válidos</span>
          <span class="badge bg-danger ms-1">{{ prev.errores }} con error</span>
        </div>
        <div>
          <button class="btn btn-outline-danger btn-sm me-2" *ngIf="prev.errores > 0" (click)="informe(prev.cargaId)"><i class="fa fa-file-excel"></i> Informe de errores</button>
          <button class="btn btn-outline-secondary btn-sm me-2" (click)="cancelar()">Cancelar carga</button>
          <button class="btn btn-success btn-sm" [disabled]="prev.validos === 0 || confirmando" (click)="confirmar()"><i class="fa fa-check"></i> Confirmar {{ prev.validos }} registros válidos</button>
        </div>
      </div>
      <div class="form-check form-switch mt-2"><input class="form-check-input" type="checkbox" id="sl" [checked]="soloErrores" (change)="soloErrores = !soloErrores"><label for="sl" class="form-check-label">Mostrar solo filas con error</label></div>
    </div>
    <div class="card-body table-responsive" style="max-height:480px; overflow:auto">
      <table class="table table-sm">
        <thead><tr><th>Fila</th><th>Estado</th><th>Nombre</th><th>Tipo</th><th>Invima</th><th>Cant.</th><th>P. compra</th><th>P. venta</th><th>Vence</th><th>Motivo del error</th></tr></thead>
        <tbody>
          <tr *ngFor="let f of filasVisibles()" [class.table-danger]="!f.valido">
            <td>{{ f.fila }}</td>
            <td><span class="badge" [ngClass]="f.valido ? 'bg-success' : 'bg-danger'">{{ f.valido ? 'Válido' : 'Error' }}</span></td>
            <td>{{ f.datos?.nombre }}</td><td>{{ f.datos?.tipo }}</td><td>{{ f.datos?.registro_invima }}</td><td>{{ f.datos?.cantidad }}</td>
            <td>{{ f.datos?.precio_compra }}</td><td>{{ f.datos?.precio_venta }}</td><td>{{ f.datos?.fecha_vencimiento }}</td>
            <td class="text-danger small">{{ f.errores }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="card" *ngIf="resultado">
    <div class="card-body">
      <h5 class="text-success"><i class="fa fa-circle-check"></i> Carga procesada</h5>
      <p class="mb-0">Importados: <strong>{{ resultado.registrosImportados }}</strong> · No importados por error: <strong>{{ resultado.registrosError }}</strong> · Estado: {{ resultado.estado }}</p>
    </div>
  </div>

  <div class="card">
    <div class="card-header"><h6 class="mb-0">Historial de cargas (usuario, fecha y resultado)</h6></div>
    <div class="card-body table-responsive">
      <table class="table table-sm">
        <thead><tr><th>#</th><th>Archivo</th><th>Fecha</th><th>Usuario</th><th class="text-end">Total</th><th class="text-end">Válidos</th><th class="text-end">Errores</th><th class="text-end">Importados</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          <tr *ngIf="historial.length === 0"><td colspan="10" class="text-center text-muted">Aún no hay cargas</td></tr>
          <tr *ngFor="let c of historial">
            <td>{{ c.id }}</td><td>{{ c.nombreArchivo }}</td><td>{{ c.fechaCarga | date:'yyyy-MM-dd HH:mm' }}</td><td>{{ c.usuario }}</td>
            <td class="text-end">{{ c.totalRegistros }}</td><td class="text-end">{{ c.registrosValidos }}</td><td class="text-end">{{ c.registrosError }}</td><td class="text-end">{{ c.registrosImportados }}</td>
            <td><span class="badge bg-secondary">{{ c.estado }}</span></td>
            <td><button class="btn btn-sm btn-outline-danger" *ngIf="c.registrosError > 0" (click)="informe(c.id)">Errores</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
`,
})
export class CargaInventarioComponent implements OnInit {
  archivo: File | null = null;
  prev: any = null;
  resultado: any = null;
  historial: any[] = [];
  cargando = false;
  confirmando = false;
  soloErrores = false;

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  elegir(e: Event): void {
    this.archivo = (e.target as HTMLInputElement).files?.[0] ?? null;
    this.prev = null;
    this.resultado = null;
  }

  filasVisibles(): any[] {
    return this.soloErrores ? this.prev.filas.filter((f: any) => !f.valido) : this.prev.filas;
  }

  previsualizar(): void {
    if (!this.archivo) return;
    const fd = new FormData();
    fd.append('archivo', this.archivo);
    this.cargando = true;
    this.api.upload<any>('/inventario/carga/previsualizar', fd).subscribe({
      next: (r) => {
        this.prev = r;
        this.resultado = null;
        this.cargando = false;
        this.cargarHistorial();
      },
      error: (e) => {
        this.cargando = false;
        this.api.error(e);
      },
    });
  }

  async confirmar(): Promise<void> {
    if (!(await this.api.confirmar('Confirmar carga', `Se importarán ${this.prev.validos} registros válidos. Los registros con error no se cargan.`))) return;
    this.confirmando = true;
    this.api.post<any>(`/inventario/carga/${this.prev.cargaId}/confirmar`).subscribe({
      next: (r) => {
        this.resultado = r;
        this.prev = null;
        this.archivo = null;
        this.confirmando = false;
        this.cargarHistorial();
      },
      error: (e) => {
        this.confirmando = false;
        this.api.error(e);
      },
    });
  }

  cancelar(): void {
    this.api.post(`/inventario/carga/${this.prev.cargaId}/cancelar`).subscribe({
      next: () => {
        this.prev = null;
        this.cargarHistorial();
      },
      error: (e) => this.api.error(e),
    });
  }

  informe(id: number): void {
    this.api.descargar(`/inventario/carga/${id}/errores`, `errores-carga-${id}.xlsx`);
  }

  plantilla(): void {
    this.api.descargar('/inventario/carga/plantilla', 'plantilla-inventario.xlsx');
  }

  private cargarHistorial(): void {
    this.api.get<any[]>('/inventario/carga').subscribe({ next: (h) => (this.historial = h), error: () => undefined });
  }
}
