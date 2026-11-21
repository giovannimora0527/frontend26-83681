import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface FormulaResumen { id: number; cita_id?: number; fecha?: string; estado_despacho?: string; }
interface Linea { id: number; medicamento_id: number; cantidad_prescrita: number; entregado: number; cantidad: number; }
interface FormulaDetalle { formula: FormulaResumen; items: Array<Omit<Linea, 'cantidad'>>; }
interface ResultadoDespacho { despachoId: number; formulaId: number; unidadesEntregadas: number; estado: string; }

@Component({
  selector: 'app-despacho-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="container py-3">
      <h3>Despacho de medicamentos</h3>
      <p>Consulta las fórmulas pendientes, verifica las cantidades y registra entregas completas o parciales.</p>
      <button class="btn btn-outline-primary mb-3" [disabled]="cargando || enviando" (click)="cargar()">Actualizar fórmulas pendientes</button>
      <div *ngIf="error" class="alert alert-danger" role="alert">{{ error }}</div>
      <div *ngIf="mensaje" class="alert alert-success" role="status">{{ mensaje }}</div>
      <p *ngIf="cargando">Consultando...</p>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead><tr><th>Fórmula</th><th>Cita</th><th>Fecha</th><th>Estado</th><th>Acción</th></tr></thead>
          <tbody>
            <tr *ngFor="let f of pendientes">
              <td>{{ f.id }}</td><td>{{ f.cita_id }}</td><td>{{ f.fecha }}</td><td>{{ f.estado_despacho }}</td>
              <td><button class="btn btn-sm btn-primary" [disabled]="cargando || enviando" (click)="consultar(f.id)">Ver medicamentos</button></td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="!cargando && !pendientes.length">No hay fórmulas pendientes o todavía no se han consultado.</p>
      </div>

      <div *ngIf="detalle" class="border rounded p-3 mt-3">
        <h5>Fórmula #{{ detalle.formula.id }}</h5>
        <p>Solo se permite entregar la cantidad pendiente. El Backend valida existencias y selecciona los lotes de entrega.</p>
        <div class="table-responsive">
          <table class="table table-bordered">
            <thead><tr><th>Línea</th><th>Medicamento</th><th>Prescrito</th><th>Entregado</th><th>Pendiente</th><th>Entregar ahora</th></tr></thead>
            <tbody>
              <tr *ngFor="let l of lineas">
                <td>{{ l.id }}</td><td>{{ l.medicamento_id }}</td><td>{{ l.cantidad_prescrita }}</td>
                <td>{{ l.entregado }}</td><td>{{ pendiente(l) }}</td>
                <td>
                  <input type="number" min="0" step="1" class="form-control" style="max-width:130px"
                    [max]="pendiente(l)" [disabled]="enviando || pendiente(l)===0" [(ngModel)]="l.cantidad"
                    [attr.aria-label]="'Cantidad a entregar del medicamento ' + l.medicamento_id">
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p><strong>Total de unidades seleccionadas:</strong> {{ totalSeleccionado() }}</p>
        <button class="btn btn-success" [disabled]="enviando || !seleccionValida()" (click)="confirmar()">
          {{ enviando ? 'Registrando...' : 'Confirmar despacho' }}
        </button>
      </div>
    </section>
  `
})
export class DespachoPanelComponent {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrlAuth + '/despacho';
  pendientes: FormulaResumen[] = [];
  detalle: FormulaDetalle | null = null;
  lineas: Linea[] = [];
  error = '';
  mensaje = '';
  cargando = false;
  enviando = false;

  private opciones() {
    const token = sessionStorage.getItem('token');
    return { headers: new HttpHeaders(token ? { Authorization: 'Bearer ' + token } : {}) };
  }

  cargar(): void {
    this.error = '';
    this.cargando = true;
    this.http.get<FormulaResumen[]>(this.api + '/pendientes', this.opciones()).subscribe({
      next: (datos) => { this.pendientes = Array.isArray(datos) ? datos : []; this.cargando = false; },
      error: (e) => { this.error = e.error?.message || 'No se pudieron consultar las fórmulas.'; this.cargando = false; }
    });
  }

  consultar(id: number): void {
    this.error = '';
    this.mensaje = '';
    this.detalle = null;
    this.lineas = [];
    this.cargando = true;
    this.http.get<FormulaDetalle>(this.api + '/formula/' + id, this.opciones()).subscribe({
      next: (datos) => {
        this.detalle = datos;
        this.lineas = (datos.items || []).map(l => ({ ...l, cantidad: 0 }));
        this.cargando = false;
      },
      error: (e) => { this.error = e.error?.message || 'No se pudo consultar el detalle de la fórmula.'; this.cargando = false; }
    });
  }

  pendiente(linea: Linea): number {
    return Math.max(0, Number(linea.cantidad_prescrita) - Number(linea.entregado));
  }

  totalSeleccionado(): number {
    return this.lineas.reduce((total, linea) => total + (Number(linea.cantidad) || 0), 0);
  }

  seleccionValida(): boolean {
    return this.lineas.length > 0 &&
      this.lineas.some(l => Number(l.cantidad) > 0) &&
      this.lineas.every(l => Number.isInteger(Number(l.cantidad)) &&
        Number(l.cantidad) >= 0 && Number(l.cantidad) <= this.pendiente(l));
  }

  confirmar(): void {
    this.error = '';
    this.mensaje = '';
    if (!this.detalle || !this.seleccionValida()) {
      this.error = 'Indica cantidades enteras y no superiores a las pendientes.';
      return;
    }
    const formulaId = this.detalle.formula.id;
    const items = this.lineas.filter(l => Number(l.cantidad) > 0)
      .map(l => ({ formulaMedicaId: Number(l.id), cantidad: Number(l.cantidad) }));
    if (!window.confirm('¿Confirmar la entrega de ' + this.totalSeleccionado() + ' unidades?')) return;
    this.enviando = true;
    this.http.post<ResultadoDespacho>(this.api + '/confirmar', { formulaId, items }, this.opciones()).subscribe({
      next: (resultado) => {
        this.enviando = false;
        this.mensaje = 'Despacho #' + resultado.despachoId + ' registrado. Estado: ' + resultado.estado +
          '. Unidades entregadas: ' + resultado.unidadesEntregadas + '.';
        this.detalle = null;
        this.lineas = [];
        this.cargar();
      },
      error: (e) => { this.error = e.error?.message || 'No se pudo confirmar el despacho.'; this.enviando = false; }
    });
  }
}
