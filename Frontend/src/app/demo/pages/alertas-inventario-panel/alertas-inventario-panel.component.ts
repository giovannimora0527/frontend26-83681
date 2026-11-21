import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';

interface AlertaStock { codigo: string; nombre: string; stock_actual: number; stock_minimo: number; fecha_proximo_pedido?: string; }
interface AlertaLote { numero_lote: string; nombre: string; fecha_vence: string; cantidad_disponible: number; }
@Component({
 selector: 'app-alertas-inventario-panel', standalone: true, imports: [CommonModule, FormsModule],
 template: `
 <section class="container py-3">
  <h3>Alertas de inventario</h3>
  <div class="row g-2 align-items-end mb-3">
   <div class="col-md-4"><label class="form-label" for="dias-vencimiento">Días de anticipación para vencimientos</label>
    <input id="dias-vencimiento" class="form-control" type="number" min="0" max="365" step="1" [(ngModel)]="dias"></div>
   <div class="col-md-4"><button class="btn btn-primary" [disabled]="cargando" (click)="cargar()">{{cargando ? 'Consultando...' : 'Actualizar alertas'}}</button></div>
  </div>
  <div *ngIf="error" class="alert alert-danger" role="alert">{{error}}</div>
  <div *ngIf="consultado" class="row g-3 mb-3">
   <div class="col-md-6"><div class="border rounded p-3"><strong>Medicamentos con stock bajo</strong><h4>{{stock.length}}</h4></div></div>
   <div class="col-md-6"><div class="border rounded p-3"><strong>Lotes próximos a vencer</strong><h4>{{lotes.length}}</h4></div></div>
  </div>
  <h5>Medicamentos con stock bajo</h5>
  <div class="table-responsive"><table class="table table-striped"><thead><tr><th>Código</th><th>Medicamento</th><th>Stock</th><th>Mínimo</th><th>Faltante</th><th>Próximo pedido</th></tr></thead>
   <tbody><tr *ngFor="let x of stock"><td>{{x.codigo}}</td><td>{{x.nombre}}</td><td>{{x.stock_actual}}</td><td>{{x.stock_minimo}}</td><td>{{faltante(x)}}</td><td>{{x.fecha_proximo_pedido || '—'}}</td></tr></tbody></table></div>
  <p *ngIf="consultado && !stock.length">No hay medicamentos con stock bajo.</p>
  <h5>Lotes próximos a vencer</h5>
  <div class="table-responsive"><table class="table table-striped"><thead><tr><th>Lote</th><th>Medicamento</th><th>Vencimiento</th><th>Disponible</th></tr></thead>
   <tbody><tr *ngFor="let x of lotes"><td>{{x.numero_lote}}</td><td>{{x.nombre}}</td><td>{{x.fecha_vence}}</td><td>{{x.cantidad_disponible}}</td></tr></tbody></table></div>
  <p *ngIf="consultado && !lotes.length">No hay lotes próximos a vencer en el período seleccionado.</p>
 </section>`
})
export class AlertasInventarioPanelComponent {
 private readonly http=inject(HttpClient);
 dias=30;stock:AlertaStock[]=[];lotes:AlertaLote[]=[];error='';cargando=false;consultado=false;
 faltante(x:AlertaStock):number {return Math.max(0,Number(x.stock_minimo)-Number(x.stock_actual));}
 cargar():void {
  this.error='';this.consultado=false;
  if(!Number.isInteger(Number(this.dias))||Number(this.dias)<0||Number(this.dias)>365){this.error='Los días deben estar entre 0 y 365.';return;}
  const token=sessionStorage.getItem('token');const headers=new HttpHeaders(token?{Authorization:'Bearer '+token}:{});
  this.cargando=true;
  forkJoin({
   stock:this.http.get<AlertaStock[]>(environment.apiUrlAuth+'/inventario/alertas/stock-bajo',{headers}),
   lotes:this.http.get<AlertaLote[]>(environment.apiUrlAuth+'/inventario/alertas/vencimientos',{headers,params:new HttpParams().set('dias',String(this.dias))})
  }).subscribe({
   next:r=>{this.stock=Array.isArray(r.stock)?r.stock:[];this.lotes=Array.isArray(r.lotes)?r.lotes:[];this.consultado=true;this.cargando=false;},
   error:e=>{this.error=e.error?.message||'No fue posible consultar las alertas de inventario.';this.cargando=false;}
  });
 }
}
