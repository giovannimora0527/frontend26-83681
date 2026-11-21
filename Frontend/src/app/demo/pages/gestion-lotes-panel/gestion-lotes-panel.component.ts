import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface Lote {
  id: number;
  medicamentoId: number;
  numeroLote: string;
  fechaVence: string;
  precioCompra: number;
  cantidadInicial: number;
  cantidadDisponible: number;
  fechaIngreso: string;
}

@Component({
  selector: 'app-gestion-lotes-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <section class="container py-3">
    <h3>Gestión de lotes</h3>
    <p>Consulta y registra lotes de medicamentos. Al registrar un lote, el Backend actualiza las existencias.</p>
    <div class="row g-2 mb-3 align-items-end">
      <div class="col-md-4">
        <label for="medicamentoId" class="form-label">ID del medicamento</label>
        <input id="medicamentoId" type="number" min="1" step="1" class="form-control" [(ngModel)]="medicamentoId">
      </div>
      <div class="col-md-3">
        <button class="btn btn-primary" [disabled]="cargando" (click)="consultar()">Consultar lotes</button>
      </div>
    </div>
    <form (ngSubmit)="registrar()" #formulario="ngForm" class="border rounded p-3 mb-3">
      <h5>Registrar nuevo lote</h5>
      <div class="row g-3">
        <div class="col-md-4">
          <label for="numeroLote" class="form-label">Número de lote</label>
          <input id="numeroLote" name="numeroLote" required maxlength="50" class="form-control" [(ngModel)]="nuevo.numeroLote">
        </div>
        <div class="col-md-4">
          <label for="fechaIngreso" class="form-label">Fecha de ingreso</label>
          <input id="fechaIngreso" name="fechaIngreso" type="date" required class="form-control" [(ngModel)]="nuevo.fechaIngreso">
        </div>
        <div class="col-md-4">
          <label for="fechaVence" class="form-label">Fecha de vencimiento</label>
          <input id="fechaVence" name="fechaVence" type="date" required class="form-control" [(ngModel)]="nuevo.fechaVence">
        </div>
        <div class="col-md-4">
          <label for="precioCompra" class="form-label">Precio de compra</label>
          <input id="precioCompra" name="precioCompra" type="number" min="0" step="0.01" required class="form-control" [(ngModel)]="nuevo.precioCompra">
        </div>
        <div class="col-md-4">
          <label for="cantidadInicial" class="form-label">Cantidad inicial</label>
          <input id="cantidadInicial" name="cantidadInicial" type="number" min="1" step="1" required class="form-control" [(ngModel)]="nuevo.cantidadInicial">
        </div>
        <div class="col-md-4 d-flex align-items-end">
          <button class="btn btn-success" type="submit" [disabled]="cargando || !formulario.valid || !medicamentoId">
            Registrar lote
          </button>
        </div>
      </div>
    </form>
    <div class="alert alert-danger" role="alert" *ngIf="error">{{ error }}</div>
    <div class="alert alert-success" role="status" *ngIf="mensaje">{{ mensaje }}</div>
    <div *ngIf="cargando">Procesando solicitud...</div>
    <div class="table-responsive" *ngIf="consultado">
      <table class="table table-striped">
        <thead><tr><th>ID</th><th>Lote</th><th>Ingreso</th><th>Vencimiento</th><th>Disponible</th><th>Precio compra</th></tr></thead>
        <tbody>
          <tr *ngFor="let lote of lotes">
            <td>{{ lote.id }}</td><td>{{ lote.numeroLote }}</td><td>{{ lote.fechaIngreso }}</td>
            <td>{{ lote.fechaVence }}</td><td>{{ lote.cantidadDisponible }}</td>
            <td>{{ lote.precioCompra | number:'1.2-2' }}</td>
          </tr>
        </tbody>
      </table>
      <p *ngIf="!lotes.length">Este medicamento todavía no tiene lotes registrados.</p>
    </div>
  </section>`
})
export class GestionLotesPanelComponent {
  private readonly http = inject(HttpClient);
  medicamentoId: number | null = null;
  lotes: Lote[] = [];
  consultado = false;
  cargando = false;
  error = '';
  mensaje = '';
  nuevo = { numeroLote: '', fechaIngreso: '', fechaVence: '', precioCompra: 0, cantidadInicial: 1 };

  private headers(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private idValido(): boolean {
    return this.medicamentoId !== null && Number.isInteger(Number(this.medicamentoId)) && Number(this.medicamentoId) > 0;
  }

  consultar(): void {
    this.error = ''; this.mensaje = '';
    if (!this.idValido()) { this.error = 'Indica un ID de medicamento válido.'; return; }
    this.cargando = true;
    this.http.get<Lote[]>(`${environment.apiUrlAuth}/inventario/lotes/medicamento/${this.medicamentoId}`, { headers: this.headers() })
      .subscribe({
        next: (lotes) => { this.lotes = lotes; this.consultado = true; this.cargando = false; },
        error: (e) => { this.error = e.error?.message || 'No fue posible consultar los lotes.'; this.cargando = false; }
      });
  }

  registrar(): void {
    this.error = ''; this.mensaje = '';
    if (!this.idValido()) { this.error = 'Indica un ID de medicamento válido.'; return; }
    if (!this.nuevo.numeroLote.trim() || this.nuevo.numeroLote.length > 50 ||
        !this.nuevo.fechaIngreso || !this.nuevo.fechaVence ||
        this.nuevo.fechaVence < this.nuevo.fechaIngreso ||
        !Number.isInteger(Number(this.nuevo.cantidadInicial)) || this.nuevo.cantidadInicial <= 0 ||
        !Number.isFinite(Number(this.nuevo.precioCompra)) || this.nuevo.precioCompra < 0) {
      this.error = 'Revisa el número de lote, las fechas, el precio y la cantidad.'; return;
    }
    this.cargando = true;
    this.http.post<Lote>(`${environment.apiUrlAuth}/inventario/lotes`,
      { medicamentoId: Number(this.medicamentoId), ...this.nuevo, numeroLote: this.nuevo.numeroLote.trim() },
      { headers: this.headers() })
      .subscribe({
        next: () => {
          this.cargando = false;
          this.mensaje = 'Lote registrado y existencias actualizadas.';
          this.nuevo = { numeroLote: '', fechaIngreso: '', fechaVence: '', precioCompra: 0, cantidadInicial: 1 };
          this.refrescar();
        },
        error: (e) => { this.cargando = false; this.error = e.error?.message || 'No fue posible registrar el lote.'; }
      });
  }

  private refrescar(): void {
    this.http.get<Lote[]>(`${environment.apiUrlAuth}/inventario/lotes/medicamento/${this.medicamentoId}`, { headers: this.headers() })
      .subscribe({ next: (lotes) => { this.lotes = lotes; this.consultado = true; },
        error: () => { this.error = 'El lote se registró, pero no se pudo actualizar la lista.'; } });
  }
}
