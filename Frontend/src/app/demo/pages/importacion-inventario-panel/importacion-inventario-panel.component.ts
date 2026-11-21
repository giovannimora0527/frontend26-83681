import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Component({selector:'app-importacion-inventario-panel',standalone:true,imports:[CommonModule,FormsModule],template:`
<section class="container py-3"><h3>Importación masiva de inventario</h3>
<p>Selecciona un archivo CSV para validar los registros antes de confirmar su carga.</p>
<input type="file" accept=".csv,text/csv" class="form-control mb-2" (change)="seleccionar($event)">
<button class="btn btn-primary me-2" [disabled]="!archivo || trabajando" (click)="enviar(false)">Vista previa</button>
<button class="btn btn-success" [disabled]="!archivo || !validado || trabajando" (click)="enviar(true)">Confirmar importación</button>
<div *ngIf="error" class="alert alert-danger mt-3">{{error}}</div><div *ngIf="exito" class="alert alert-success mt-3">{{exito}}</div>
<pre *ngIf="resultado" class="border rounded p-3 mt-3" style="white-space:pre-wrap">{{resultado | json}}</pre>
</section>`})
export class ImportacionInventarioPanelComponent {
 private http=inject(HttpClient);archivo:File|null=null;validado=false;trabajando=false;resultado:any=null;error='';exito='';
 seleccionar(event:Event){const el=event.target as HTMLInputElement;this.archivo=el.files?.[0]||null;this.validado=false;this.resultado=null;this.error='';this.exito='';}
 enviar(confirmar:boolean){if(!this.archivo)return;this.trabajando=true;this.error='';this.exito='';
 const form=new FormData();form.append('archivo',this.archivo,this.archivo.name);
 const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders(token ? {Authorization: 'Bearer ' + token} : {});
 this.http.post<any>(environment.apiUrlAuth+'/inventario/importacion/'+(confirmar?'confirmar':'vista-previa'),form,{headers}).subscribe({next:r=>{this.resultado=r;this.validado=!confirmar;this.trabajando=false;this.exito=confirmar?'Importación procesada. Consulta el resultado para comprobar registros y errores.':'Vista previa generada. Revisa las validaciones antes de confirmar.';},error:e=>{this.error=e.error?.message||e.error?.detail||'No fue posible procesar el archivo';this.trabajando=false;}});
 }
}
