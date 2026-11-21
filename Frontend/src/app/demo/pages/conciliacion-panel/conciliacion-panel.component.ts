import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Component({selector:'app-conciliacion-panel',standalone:true,imports:[CommonModule,FormsModule],template:`
<section class="container py-3"><h3>Conciliación financiera</h3><div class="row g-2 mb-3"><div class="col-auto"><label>Desde <input type="date" class="form-control" [(ngModel)]="inicio"></label></div><div class="col-auto"><label>Hasta <input type="date" class="form-control" [(ngModel)]="fin"></label></div><div class="col-auto align-self-end"><button class="btn btn-primary" (click)="consultar()">Consultar</button></div></div>
<div *ngIf="error" class="alert alert-danger">{{error}}</div><pre *ngIf="resultado" class="border rounded p-3">{{resultado | json}}</pre></section>`})
export class ConciliacionPanelComponent {
 private http=inject(HttpClient);inicio=new Date().toISOString().slice(0,10);fin=this.inicio;resultado:any=null;error='';
 consultar(){this.error='';if(this.inicio>this.fin){this.error='La fecha inicial debe ser anterior o igual a la final';return;}
 const token=sessionStorage.getItem('token');const headers=new HttpHeaders(token?{Authorization:'Bearer '+token}:{});
 this.http.get(environment.apiUrlAuth+'/reportes/conciliacion',{headers,params:new HttpParams().set('inicio',this.inicio).set('fin',this.fin)}).subscribe({next:r=>this.resultado=r,error:e=>this.error=e.error?.message||'No se pudo consultar la conciliación'});}
}
