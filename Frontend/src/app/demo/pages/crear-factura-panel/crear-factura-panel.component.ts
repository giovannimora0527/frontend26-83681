import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Component({selector:'app-crear-factura-panel',standalone:true,imports:[CommonModule,FormsModule],template:`
<section class="container py-3"><h3>Crear factura de atención</h3>
<div class="row g-2 mb-3"><div class="col-md-3"><label>ID cita<input class="form-control" type="number" min="1" [(ngModel)]="citaId"></label></div>
<div class="col-md-3"><label>Descuento ($)<input class="form-control" type="number" min="0" step="0.01" [(ngModel)]="descuento"></label></div></div>
<h5>Detalles</h5><div class="table-responsive"><table class="table"><thead><tr><th>Tipo</th><th>Descripción</th><th>ID medicamento</th><th>Cantidad</th><th>Precio unitario</th><th>IVA %</th><th></th></tr></thead><tbody>
<tr *ngFor="let d of detalles;index as i"><td><select class="form-select" [(ngModel)]="d.tipo"><option>SERVICIO</option><option>MEDICAMENTO</option><option>PRODUCTO</option></select></td>
<td><input class="form-control" [(ngModel)]="d.descripcion"></td><td><input class="form-control" type="number" min="1" [(ngModel)]="d.medicamentoId" [disabled]="d.tipo==='SERVICIO'"></td>
<td><input class="form-control" type="number" min="1" [(ngModel)]="d.cantidad"></td><td><input class="form-control" type="number" min="0" step="0.01" [(ngModel)]="d.precioUnitario"></td>
<td><input class="form-control" type="number" min="0" max="100" [(ngModel)]="d.porcentajeIva"></td><td><button class="btn btn-outline-danger" (click)="quitar(i)" [disabled]="detalles.length===1">Quitar</button></td></tr></tbody></table></div>
<div class="border rounded p-3 mb-3" aria-live="polite">
<h5>Vista previa de la factura</h5>
<p><b>Subtotal:</b> {{subtotal | number:'1.2-2'}} · <b>IVA:</b> {{iva | number:'1.2-2'}} · <b>Descuento:</b> {{descuento | number:'1.2-2'}} · <b>Total estimado:</b> {{totalEstimado | number:'1.2-2'}}</p>
<p *ngIf="descuento>subtotal+iva" class="text-danger">El descuento supera el valor de la factura.</p>
</div>
<button class="btn btn-outline-secondary me-2" (click)="agregar()">Agregar detalle</button><button class="btn btn-primary" (click)="crear()" [disabled]="trabajando || !formularioValido">Crear factura</button>
<div *ngIf="error" class="alert alert-danger mt-3">{{error}}</div><pre *ngIf="resultado" class="border rounded p-3 mt-3">{{resultado | json}}</pre></section>`})
export class CrearFacturaPanelComponent {
 private http=inject(HttpClient);citaId:number|null=null;descuento=0;trabajando=false;error='';resultado:any=null;
 detalles:any[]=[{tipo:'SERVICIO',descripcion:'',medicamentoId:null,cantidad:1,precioUnitario:0,porcentajeIva:0}];
 get subtotal():number {return this.detalles.reduce((s,d)=>s+(Number(d.cantidad)||0)*(Number(d.precioUnitario)||0),0);}
 get iva():number {return this.detalles.reduce((s,d)=>s+(Number(d.cantidad)||0)*(Number(d.precioUnitario)||0)*(Number(d.porcentajeIva)||0)/100,0);}
 get totalEstimado():number {return Math.max(0,this.subtotal+this.iva-(Number(this.descuento)||0));}
 get detallesValidos():boolean {return this.detalles.length>0 && this.detalles.every(d=>
  ['SERVICIO','MEDICAMENTO','PRODUCTO'].includes(d.tipo) &&
  typeof d.descripcion==='string' && !!d.descripcion.trim() &&
  Number.isInteger(Number(d.cantidad)) && Number(d.cantidad)>0 &&
  Number.isFinite(Number(d.precioUnitario)) && Number(d.precioUnitario)>=0 &&
  Number.isFinite(Number(d.porcentajeIva)) && Number(d.porcentajeIva)>=0 && Number(d.porcentajeIva)<=100 &&
  (d.tipo==='SERVICIO' || (Number.isInteger(Number(d.medicamentoId)) && Number(d.medicamentoId)>0))
 );}
 get formularioValido():boolean {return Number.isInteger(Number(this.citaId)) && Number(this.citaId)>0 &&
 Number.isFinite(Number(this.descuento)) && Number(this.descuento)>=0 && Number(this.descuento)<=this.subtotal+this.iva &&
 this.detallesValidos;}

 agregar(){this.detalles.push({tipo:'SERVICIO',descripcion:'',medicamentoId:null,cantidad:1,precioUnitario:0,porcentajeIva:0});}
 quitar(i:number){if(this.detalles.length>1)this.detalles.splice(i,1);}
 crear(){this.error='';this.resultado=null;
 if(this.trabajando)return;
 if(!this.formularioValido){this.error='Revisa el ID de la cita, tipos, descripciones, cantidades enteras, precios, IVA, descuentos e ID de medicamento/producto.';return;}
 const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders(token ? {Authorization: 'Bearer ' + token} : {});
 this.trabajando=true;this.http.post(environment.apiUrlAuth+'/factura/gestion',{citaId:this.citaId,descuento:this.descuento,detalles:this.detalles.map(d=>({...d,medicamentoId:d.tipo==='SERVICIO'?null:d.medicamentoId}))},{headers}).subscribe({next:r=>{this.resultado=r;this.trabajando=false;},error:e=>{this.error=e.error?.message||e.error?.detail||'No se pudo crear la factura';this.trabajando=false;}});
 }
}
