import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
 selector:'app-documentos-panel', standalone:true, imports:[CommonModule,FormsModule],
 template:`<section class="container py-3"><h3>Documentos clínicos y financieros</h3>
 <p>Genera y descarga documentos PDF de facturas y fórmulas médicas registradas.</p>
 <div class="row g-3 mb-3"><div class="col-md-4"><label for="factura" class="form-label">ID de factura</label>
 <input id="factura" class="form-control" type="number" min="1" step="1" [(ngModel)]="facturaId"></div>
 <div class="col-md-4 d-flex align-items-end"><button class="btn btn-primary" [disabled]="descargando!=='' || !valido(facturaId)" (click)="descargar('factura',facturaId)">{{descargando==='factura'?'Generando...':'Descargar factura PDF'}}</button></div></div>
 <div class="row g-3 mb-3"><div class="col-md-4"><label for="formula" class="form-label">ID de fórmula</label>
 <input id="formula" class="form-control" type="number" min="1" step="1" [(ngModel)]="formulaId"></div>
 <div class="col-md-4 d-flex align-items-end"><button class="btn btn-primary" [disabled]="descargando!=='' || !valido(formulaId)" (click)="descargar('formula',formulaId)">{{descargando==='formula'?'Generando...':'Descargar fórmula PDF'}}</button></div></div>
 <div *ngIf="error" role="alert" class="alert alert-danger">{{error}}</div>
 <div *ngIf="mensaje" role="status" class="alert alert-success">{{mensaje}}</div></section>`
})
export class DocumentosPanelComponent {
 private readonly http=inject(HttpClient);
 facturaId:number|null=null;formulaId:number|null=null;error='';mensaje='';descargando='';
 valido(id:number|null):boolean{return id!==null && Number.isInteger(Number(id)) && Number(id)>0;}
 descargar(tipo:'factura'|'formula',id:number|null):void{
  this.error='';this.mensaje='';if(!this.valido(id)){this.error='Ingresa un identificador válido.';return;}
  const token=sessionStorage.getItem('token');
  const headers=new HttpHeaders(token?{Authorization:'Bearer '+token}:{});
  this.descargando=tipo;
  this.http.get(environment.apiUrlAuth+'/reportes/documentos/'+tipo+'/'+id+'.pdf',{headers,responseType:'blob'}).subscribe({
   next:blob=>{
    this.descargando='';
    if(blob.size===0){this.error='El servidor devolvió un archivo vacío.';return;}
    const url=URL.createObjectURL(blob);const a=document.createElement('a');
    a.href=url;a.download=tipo+'-'+id+'.pdf';document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    this.mensaje='Documento generado correctamente.';
   },error:e=>{this.descargando='';this.error=e.status===403?'No tienes permisos para descargar este documento.':'No fue posible generar el PDF. Comprueba el identificador y el estado del Backend.';}
  });
 }
}
