import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Component({selector:'app-registro-pagos-panel',standalone:true,imports:[CommonModule,FormsModule],template:`
<section class="container py-3"><h3>Consulta y registro de pagos</h3>
<div class="row g-2 mb-3"><div class="col-md-3"><label>ID factura<input class="form-control" type="number" min="1" [(ngModel)]="facturaId"></label></div>
<div class="col-md-3 align-self-end"><button class="btn btn-outline-primary" (click)="consultar()">Consultar saldo</button></div></div>
<div *ngIf="resumen"><p><b>Total:</b> {{resumen.factura?.total}} · <b>Pagado:</b> {{resumen.pagado}} · <b>Pendiente:</b> {{resumen.pendiente}}</p></div>
<div class="row g-2 mb-3"><div class="col-md-3"><label>Valor a pagar<input class="form-control" type="number" min="0.01" step="0.01" [(ngModel)]="valor"></label></div>
<div class="col-md-3"><label>Método<select class="form-select" [(ngModel)]="metodo"><option>EFECTIVO</option><option>TARJETA</option><option>TRANSFERENCIA</option></select></label></div>
<div class="col-md-3 align-self-end"><button class="btn btn-success" [disabled]="trabajando || !pagoValido" (click)="registrar()">Registrar pago</button></div></div>
<div *ngIf="error" class="alert alert-danger">{{error}}</div><div *ngIf="exito" class="alert alert-success">{{exito}}</div>
<pre *ngIf="resumen" class="border rounded p-3">{{resumen | json}}</pre></section>`})
export class RegistroPagosPanelComponent {
 get saldoDisponible():number {return Math.max(0,Number(this.resumen?.pendiente)||0);}
 get pagoValido():boolean {return !!this.resumen && Number.isInteger(Number(this.facturaId)) && Number(this.facturaId)>0 &&
 this.valor!==null && Number.isFinite(Number(this.valor)) && Number(this.valor)>0 &&
 Number(this.valor)<=this.saldoDisponible && ['EFECTIVO','TARJETA','TRANSFERENCIA'].includes(this.metodo);}

 private http=inject(HttpClient);facturaId:number|null=null;valor:number|null=null;metodo='EFECTIVO';resumen:any=null;trabajando=false;error='';exito='';
 consultar(){if(this.trabajando)return;this.resumen=null;if(!Number.isInteger(Number(this.facturaId))||Number(this.facturaId)<=0){this.error='Indica un ID de factura válido';return;}this.error='';
 const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders(token ? {Authorization: 'Bearer ' + token} : {});
 this.http.get(environment.apiUrlAuth+'/pago/gestion/factura/'+this.facturaId,{headers}).subscribe({next:r=>this.resumen=r,error:e=>this.error=e.error?.message||'No se pudo consultar la factura'});}
 registrar(){if(this.trabajando)return;if(!this.pagoValido){this.error='Consulta primero la factura y registra un pago mayor que cero, sin superar el saldo pendiente';return;}this.error='';this.exito='';
 const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders(token ? {Authorization: 'Bearer ' + token} : {});
 this.trabajando=true;this.http.post(environment.apiUrlAuth+'/pago/gestion',{facturaId:this.facturaId,valor:this.valor,metodo:this.metodo},{headers}).subscribe({next:()=>{this.trabajando=false;this.exito='Pago registrado correctamente';this.valor=null;this.consultar();},error:e=>{this.error=e.error?.message||e.error?.detail||'No se pudo registrar el pago';this.trabajando=false;}});
 }
}
