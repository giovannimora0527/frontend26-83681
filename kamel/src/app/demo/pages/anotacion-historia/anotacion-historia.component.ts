import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
@Component({selector:'app-anotacion-historia',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./anotacion-historia.component.html',styleUrl:'./anotacion-historia.component.scss'})
export class AnotacionHistoriaComponent implements OnInit { anotaciones:any[]=[]; filtro=''; error=''; cargando=false; pagina=1; readonly porPagina=10; constructor(private http:HttpClient){} ngOnInit():void{this.cargar();} cargar():void{this.cargando=true;this.http.get<any[]>(`${environment.apiUrlAuth}/gestion/anotaciones`).subscribe({next:x=>{this.anotaciones=x||[];this.cargando=false;},error:e=>{this.error=e?.error?.message||'No fue posible cargar las anotaciones.';this.cargando=false;}});} get filtradas():any[]{const q=this.filtro.toLowerCase().trim();return this.anotaciones.filter(a=>[a.id,a.descripcion,a.medico?.nombres,a.medico?.apellidos,a.historia?.mascota?.nombreMascota,a.fecha].join(' ').toLowerCase().includes(q));} get datos():any[]{return this.filtradas.slice((this.pagina-1)*this.porPagina,this.pagina*this.porPagina);} get paginas():number{return Math.max(1,Math.ceil(this.filtradas.length/this.porPagina));}}
