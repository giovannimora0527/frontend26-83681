import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Component({selector:'app-finanzas-panel',standalone:true,imports:[CommonModule,FormsModule],template:`
<section class="container py-3"><h3>Reportes financieros</h3><div class="row g-2 mb-3"><div class="col-auto"><label>Desde<input class="form-control" type="date" [(ngModel)]="inicio"></label></div><div class="col-auto"><label>Hasta<input class="form-control" type="date" [(ngModel)]="fin"></label></div><div class="col-auto align-self-end"><button class="btn btn-primary me-2" (click)="consultar()">Consultar</button><button class="btn btn-outline-success" (click)="exportar()">Exportar Excel</button></div></div>
<div *ngIf="error" class="alert alert-danger">{{error}}</div><h5>Resumen</h5><pre *ngIf="resumen" class="border rounded p-3">{{resumen | json}}</pre><h5>Facturas</h5>
<div class="table-responsive"><table class="table table-striped"><thead><tr><th>Número</th><th>Fecha</th><th>Total</th><th>Estado</th></tr></thead><tbody><tr *ngFor="let f of facturas"><td>{{f.numero}}</td><td>{{f.fecha}}</td><td>{{f.total}}</td><td>{{f.estado}}</td></tr></tbody></table></div></section>`})
export class FinanzasPanelComponent {
 private http=inject(HttpClient);inicio=new Date().toISOString().slice(0,10);fin=this.inicio;resumen:any=null;facturas:any[]=[];error='';
 private valid(){if(!this.inicio||!this.fin||this.inicio>this.fin){this.error='Rango de fechas inválido';return false;}this.error='';return true;}
 private headers(){const t=sessionStorage.getItem('token');return new HttpHeaders(t?{Authorization:'Bearer '+t}:{});}
 consultar(){if(!this.valid())return;const params=new HttpParams().set('inicio',this.inicio).set('fin',this.fin);const headers=this.headers();
 this.http.get(environment.apiUrlAuth+'/reportes/finanzas/resumen',{params,headers}).subscribe({next:r=>this.resumen=r,error:e=>this.error=e.error?.message||'No se pudo cargar el resumen'});
 this.http.get<any[]>(environment.apiUrlAuth+'/reportes/finanzas/facturas',{params,headers}).subscribe({next:r=>this.facturas=Array.isArray(r)?r:[],error:e=>this.error=e.error?.message||'No se pudieron cargar las facturas'});}
 exportar(){if(!this.valid())return;const params=new HttpParams().set('desde',this.inicio).set('hasta',this.fin);
 this.http.get(environment.apiUrlAuth+'/reportes/financieros/facturas.xlsx',{params,headers:this.headers(),responseType:'blob'}).subscribe({next:blob=>{const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='facturas-'+this.inicio+'-'+this.fin+'.xlsx';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},error:e=>this.error=e.error?.message||'No se pudo descargar el Excel'});}
}
