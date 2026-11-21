import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
 selector:'app-control-citas-panel', standalone:true, imports:[CommonModule,FormsModule],
 template:`
 <section class="container py-3">
  <h3>Control de citas</h3>
  <p>Consulta los solapamientos registrados para evitar asignar el mismo horario a un veterinario.</p>
  <div class="row g-2 mb-3 align-items-end">
   <div class="col-md-3"><label for="control-inicio" class="form-label">Desde</label><input id="control-inicio" class="form-control" type="date" [(ngModel)]="inicio"></div>
   <div class="col-md-3"><label for="control-fin" class="form-label">Hasta</label><input id="control-fin" class="form-control" type="date" [(ngModel)]="fin"></div>
   <div class="col-md-3"><button class="btn btn-primary" [disabled]="cargando" (click)="consultar()">{{cargando ? 'Revisando...' : 'Revisar conflictos'}}</button></div>
  </div>
  <div *ngIf="error" class="alert alert-danger" role="alert">{{error}}</div>
  <p *ngIf="consultado"><strong>{{conflictos.length}}</strong> conflicto(s) detectado(s).</p>
  <div *ngIf="consultado && !conflictos.length" class="alert alert-success">No se encontraron conflictos para el período consultado.</div>
  <div class="table-responsive" *ngIf="conflictos.length">
   <table class="table table-striped"><thead><tr><th>Registro</th><th>Detalle</th></tr></thead><tbody>
    <tr *ngFor="let c of conflictos;index as i"><td>{{i+1}}</td><td><pre class="mb-0" style="white-space:pre-wrap">{{c | json}}</pre></td></tr>
   </tbody></table>
  </div>
 </section>`
})
export class ControlCitasPanelComponent {
 private readonly http=inject(HttpClient);
 inicio=this.fechaLocal();fin=this.inicio;conflictos:any[]=[];error='';cargando=false;consultado=false;
 private fechaLocal():string {
  const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
 }
 consultar():void {
  this.error='';this.consultado=false;
  if(!this.inicio||!this.fin||this.inicio>this.fin){this.error='Selecciona un rango de fechas válido.';return;}
  const token=sessionStorage.getItem('token');const headers=new HttpHeaders(token?{Authorization:'Bearer '+token}:{});
  const params=new HttpParams().set('inicio',this.inicio).set('fin',this.fin);
  this.cargando=true;
  this.http.get<any>(environment.apiUrlAuth+'/cita/control/solapamientos',{headers,params}).subscribe({
   next:r=>{this.conflictos=Array.isArray(r)?r:(Array.isArray(r?.conflictos)?r.conflictos:[]);this.cargando=false;this.consultado=true;},
   error:e=>{this.error=e.error?.message||'No fue posible consultar los conflictos de citas.';this.cargando=false;}
  });
 }
}
