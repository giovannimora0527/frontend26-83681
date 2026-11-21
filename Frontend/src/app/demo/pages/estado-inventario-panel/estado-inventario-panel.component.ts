import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({selector:'app-estado-inventario-panel',standalone:true,imports:[CommonModule,FormsModule],template:`
<section class="container py-3"><h3>Estado general del inventario</h3>
<p>Consulta existencias y descarga el reporte CSV.</p>
<div class="mb-3"><button class="btn btn-primary me-2" [disabled]="cargando" (click)="consultar()">Actualizar estado</button>
<button class="btn btn-outline-success" [disabled]="cargando" (click)="descargar()">{{descargando?'Descargando...':'Descargar CSV'}}</button></div>
<div *ngIf="error" class="alert alert-danger" role="alert">{{error}}</div><p *ngIf="cargando" role="status">Procesando...</p>
<div *ngIf="datos!==null"><p *ngIf="filas.length">Medicamentos consultados: <strong>{{filas.length}}</strong></p>
<div class="table-responsive" *ngIf="filas.length"><table class="table table-striped"><thead><tr><th>Código</th><th>Medicamento</th><th>Stock</th><th>Mínimo</th><th>Estado</th></tr></thead><tbody>
<tr *ngFor="let m of filas"><td>{{m.codigo}}</td><td>{{m.nombre}}</td><td>{{stock(m)}}</td><td>{{minimo(m)}}</td>
<td><span [class.text-danger]="stock(m)<=minimo(m)">{{stock(m)<=minimo(m)?'Stock bajo':'Normal'}}</span></td></tr></tbody></table></div>
<pre *ngIf="!filas.length" class="border rounded p-3" style="white-space:pre-wrap">{{datos | json}}</pre></div></section>`})
export class EstadoInventarioPanelComponent {
 private readonly http=inject(HttpClient);
 datos:any=null;filas:any[]=[];error='';cargando=false;descargando=false;
 stock(m:any):number{return Number(m.stockActual??m.stock_actual??0);}
 minimo(m:any):number{return Number(m.stockMinimo??m.stock_minimo??0);}
 private headers():HttpHeaders{const t=sessionStorage.getItem('token');return new HttpHeaders(t?{Authorization:'Bearer '+t}:{});}
 consultar():void{
  this.error='';this.cargando=true;
  this.http.get<any>(environment.apiUrlAuth+'/inventario/reportes/estado',{headers:this.headers()}).subscribe({
   next:r=>{this.datos=r;this.filas=Array.isArray(r)?r:Array.isArray(r?.medicamentos)?r.medicamentos:[];this.cargando=false;},
   error:e=>{this.error=e.status===403?'No tienes permisos para consultar el inventario.':e.error?.message||'No fue posible consultar el inventario.';this.cargando=false;}
  });
 }
 descargar():void{
  this.error='';this.cargando=true;this.descargando=true;
  this.http.get(environment.apiUrlAuth+'/inventario/reportes/estado.csv',{headers:this.headers(),responseType:'blob'}).subscribe({
   next:blob=>{this.cargando=false;this.descargando=false;if(blob.size===0){this.error='El reporte está vacío.';return;}
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='estado-inventario.csv';
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);},
   error:e=>{this.cargando=false;this.descargando=false;this.error=e.status===403?'No tienes permisos para descargar este reporte.':'No fue posible descargar el CSV.';}
  });
 }
}
