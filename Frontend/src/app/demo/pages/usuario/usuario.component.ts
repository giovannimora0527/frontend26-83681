import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface Perfil { perfilId: number; nombre: string; }
interface Usuario { id: number; username: string; email: string; rol: string; activo: boolean; }
@Component({
 selector:'app-usuario', standalone:true,
 imports:[CommonModule, FormsModule],
 templateUrl:'./usuario.component.html', styleUrl:'./usuario.component.scss'
})
export class UsuarioComponent implements OnInit {
 perfiles: Perfil[]=[]; usuarios:Usuario[]=[]; cargando=false; guardando=false; error=''; mensaje='';
 nuevo={username:'', email:'', password:'', perfilId:0, rol:'', activo:true};
 constructor(private http:HttpClient){}
 private headers():HttpHeaders {
  const token=sessionStorage.getItem('token');
  return new HttpHeaders(token?{Authorization:'Bearer '+token}:{});
 }
 ngOnInit():void {this.cargar();}
 cargar():void {
  this.error='';this.cargando=true;
  this.http.get<Perfil[]>(environment.apiUrlAuth+'/usuario/perfiles',{headers:this.headers()}).subscribe({
   next:p=>{this.perfiles=p;this.cargando=false;},
   error:e=>{this.error='Perfiles: '+this.mensajeError(e,'No fue posible cargar los perfiles.');this.cargando=false;}
  });
  this.http.get<Usuario[]>(environment.apiUrlAuth+'/usuario/listar-ordenado',{headers:this.headers()}).subscribe({
   next:u=>this.usuarios=u,
   error:e=>this.error='Usuarios: '+this.mensajeError(e,'No fue posible cargar los usuarios.')
  });
 }
 habilitarDespacho():void {
  this.error='';this.guardando=true;
  this.http.post<Perfil>(environment.apiUrlAuth+'/usuario/perfiles/habilitar-despacho',{}, {headers:this.headers()}).subscribe({
   next:p=>{this.guardando=false;this.mensaje='Perfil de despacho habilitado.';this.nuevo.perfilId=p.perfilId;this.cargar();},
   error:e=>{this.guardando=false;this.error=this.mensajeError(e,'No fue posible habilitar el perfil de despacho.');}
  });
 }
 guardar():void {
  this.error='';this.mensaje='';
  const perfil=this.perfiles.find(p=>Number(p.perfilId)===Number(this.nuevo.perfilId));
  if(!this.nuevo.username.trim()||!this.nuevo.email.trim()||!this.nuevo.password||!perfil){
   this.error='Completa usuario, correo, contraseña y perfil.';return;
  }
  this.guardando=true;
  const payload={...this.nuevo, username:this.nuevo.username.trim(),email:this.nuevo.email.trim(),rol:perfil.nombre,perfilId:perfil.perfilId};
  this.http.post<any>(environment.apiUrlAuth+'/usuario/guardar',payload,{headers:this.headers()}).subscribe({
   next:()=>{this.guardando=false;this.mensaje='Usuario creado correctamente.';
    this.nuevo={username:'',email:'',password:'',perfilId:perfil.perfilId,rol:'',activo:true};this.cargar();},
   error:e=>{this.guardando=false;this.error=this.mensajeError(e,'No fue posible crear el usuario.');}
  });
 }
 private mensajeError(e:any, alternativo:string):string {
  if (e?.status === 0) return 'No se pudo conectar con el Backend. Verifica que Spring Boot esté ejecutándose en el puerto 8081.';
  if (e?.status === 401) return 'Tu sesión venció o no se envió el token. Cierra sesión y vuelve a ingresar.';
  if (e?.status === 403) return 'Acceso denegado: inicia sesión con un usuario del perfil Administrador.';
  if (e?.status === 415) return 'La petición fue rechazada por el tipo de contenido. Reinicia el Backend con la corrección incluida.';
  if (typeof e?.error?.message === 'string') return e.error.message;
  return alternativo + (e?.status ? ' (HTTP ' + e.status + ')' : '');
 }
}
