import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({selector:'app-auditoria-despacho-panel',standalone:true,imports:[CommonModule,FormsModule],template:`
<section class="container py-3"><h3>Auditoría de despacho</h3>
<p>Consulta los datos de auditoría de un despacho registrado.</p>
<div class="row g-3 mb-3 align-items-end"><div class="col-md-4"><label for="despachoId" class="form-label">ID de despacho</label>
<input id="despachoId" class="form-control" type="number" min="1" step="1" [(ngModel)]="despachoId"></div>
<div class="col-md-3"><button class="btn btn-primary" [disabled]="cargando" (click)="consultar()">Consultar auditoría</button></div></div>
<div *ngIf="error" role="alert" class="alert alert-danger">{{error}}</div>
<p *ngIf="cargando" role="status">Consultando...</p>
<div *ngIf="resultado!==null && !cargando"><h5>Resultado del despacho #{{despachoId}}</h5>
<div class="table-responsive" *ngIf="filas.length"><table class="table table-striped"><thead><tr><th>Campo</th><th>Valor</th></tr></thead><tbody>
<tr *ngFor="let fila of filas"><td>{{fila.campo}}</td><td>{{fila.valor}}</td></tr></tbody></table></div>
<pre class="border rounded p-3" style="white-space:pre-wrap">{{resultado | json}}</pre></div></section>`})
export class AuditoriaDespachoPanelComponent {
 private readonly http=inject(HttpClient);
 despachoId:number|null=null;resultado:any=null;filas:Array<{campo:string;valor:string}>=[];error='';cargando=false;
 consultar():void{
  this.error='';this.resultado=null;this.filas=[];
  if(this.despachoId===null||!Number.isInteger(Number(this.despachoId))||Number(this.despachoId)<1){this.error='Ingresa un ID de despacho válido.';return;}
  const token=sessionStorage.getItem('token');const headers=new HttpHeaders(token?{Authorization:'Bearer '+token}:{});
  this.cargando=true;
  this.http.get<any>(environment.apiUrlAuth+'/despacho/auditoria/'+this.despachoId,{headers}).subscribe({
   next:r=>{
    this.resultado=r;
    if(r && typeof r==='object' && !Array.isArray(r)){
     this.filas=Object.keys(r).filter(k=>typeof r[k]!=='object').map(k=>({campo:k,valor:String(r[k])}));
    }
    this.cargando=false;
   },error:e=>{this.error=e.status===403?'No tienes permisos para consultar esta auditoría.':e.error?.message||'No fue posible consultar la auditoría.';this.cargando=false;}
  });
 }
}
