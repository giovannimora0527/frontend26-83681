import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface Cliente {
  id: number; nombres: string; apellidos: string; tipoDocumento: string;
  numeroDocumento: string; telefono?: string; direccion?: string; activo?: boolean;
}
@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.scss'
})
export class ClienteComponent implements OnInit {
  clientes: Cliente[] = [];
  filtro = '';
  cargando = false;
  error = '';
  creando = false;
  guardando = false;
  nuevo = { nombres: '', apellidos: '', tipoDocumento: 'CC', numeroDocumento: '',
    fechaNacimiento: '', genero: '', telefono: '', direccion: '' };
  crear(): void {
    if (this.guardando) return;
    this.error = '';
    if (!this.nuevo.nombres.trim() || !this.nuevo.apellidos.trim() ||
        !this.nuevo.numeroDocumento.trim() || !this.nuevo.fechaNacimiento) {
      this.error = 'Complete los campos obligatorios.'; return;
    }
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders(token ? { Authorization: 'Bearer ' + token } : {});
    this.guardando = true;
    this.http.post(environment.apiUrlAuth + '/cliente/crear', this.nuevo, {headers}).subscribe({
      next: () => {
        this.guardando = false; this.creando = false;
        this.nuevo = { nombres: '', apellidos: '', tipoDocumento: 'CC', numeroDocumento: '',
          fechaNacimiento: '', genero: '', telefono: '', direccion: '' };
        this.cargar();
      },
      error: e => {
        this.guardando = false;
        this.error = e.status === 409 ? 'Ya existe un cliente con ese documento.' :
          e.status === 403 ? 'Tu perfil no tiene permiso para crear clientes.' :
          'No se pudo crear el cliente (HTTP ' + e.status + ').';
      }
    });
  }

  constructor(private readonly http: HttpClient) {}
  ngOnInit(): void { this.cargar(); }
  get filtrados(): Cliente[] {
    const q = this.filtro.trim().toLowerCase();
    return this.clientes.filter(c => !q || [c.nombres,c.apellidos,c.numeroDocumento,c.telefono]
      .some(x => String(x ?? '').toLowerCase().includes(q)));
  }
  cargar(): void {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders(token ? { Authorization: 'Bearer ' + token } : {});
    this.error = ''; this.cargando = true;
    this.http.get<Cliente[]>(environment.apiUrlAuth + '/cliente/listar', {headers}).subscribe({
      next: (data) => { this.clientes = Array.isArray(data) ? data : []; this.cargando = false; },
      error: (e) => {
        this.cargando = false;
        this.error = e.status === 0 ? 'No se pudo establecer conexión con el Backend (HTTP 0). Revisa que esté iniciado y la configuración CORS.'
          : e.status === 401 ? 'Sesión vencida. Inicia sesión nuevamente.'
          : e.status === 403 ? 'No tienes permisos para consultar clientes.'
          : 'No se pudieron consultar los clientes (HTTP ' + e.status + ').';
      }
    });
  }
}
