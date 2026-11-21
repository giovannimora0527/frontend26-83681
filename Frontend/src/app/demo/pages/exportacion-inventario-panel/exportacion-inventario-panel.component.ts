import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
 selector:'app-exportacion-inventario-panel', standalone:true,
 imports:[CommonModule,FormsModule],
 template:`
 <section class="container py-3"><h3>Exportación de inventario</h3>
 <p>Consulta el estado actual del inventario y descarga un archivo CSV.</p>
 <div class="mb-3"><button class="btn btn-primary me-2" [disabled]="cargando" (click)="consultar()">Consultar estado</button>
 <button class="btn btn-outline-success" [disabled]="cargando" (click)="descargar()">Descargar CSV</button></div>
 <div *ngIf="error" class="alert alert-danger">{{error}}</div>
 <p *ngIf="cargando">Procesando...</p>
 <pre *ngIf="estado!==null" class="border rounded p-3" style="white-space:pre-wrap">{{estado | json}}</pre>
 </section>`
})
export class ExportacionInventarioPanelComponent {
 private http=inject(HttpClient);
 estado:any=null;error='';cargando=false;
 private headers(){
  const token=sessionStorage.getItem('token');
  return new HttpHeaders(token?{Authorization:'Bearer '+token}:{});
 }
 consultar(){
  this.error='';this.cargando=true;
  this.http.get<any>(environment.apiUrlAuth+'/inventario/reportes/estado',{headers:this.headers()})
   .subscribe({next:r=>{this.estado=r;this.cargando=false;},
    error:e=>{this.error=e.error?.message||'No se pudo consultar el inventario.';this.cargando=false;}});
 }
 descargar(){
  this.error='';this.cargando=true;
  this.http.get(environment.apiUrlAuth+'/inventario/reportes/estado.csv',{headers:this.headers(),responseType:'blob'})
   .subscribe({next:blob=>{
     const url=URL.createObjectURL(blob);const a=document.createElement('a');
     a.href=url;a.download='estado_inventario.csv';a.click();
     URL.revokeObjectURL(url);this.cargando=false;
    },error:e=>{this.error=e.error?.message||'No se pudo descargar el CSV.';this.cargando=false;}});
 }
}
