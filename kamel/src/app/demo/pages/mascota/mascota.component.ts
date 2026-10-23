
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Cliente } from 'src/app/models/cliente';
import { environment } from 'src/environments/environment';

interface ClienteApiItem {
  id?: number;
  cliente_id?: number;
  nombres?: string;
  apellidos?: string;
  numeroDocumento?: string;
  numero_documento?: string;
}

interface RazaItem {
  razaId: number;
  nombre: string;
  especie: string;
}

interface MascotaItem {
  mascota_id?: number;
  mascotaId?: number;
  nombre_mascota?: string;
  nombreMascota?: string;
  edad?: number | null;
  fecha_registro?: string;
  fechaRegistro?: string;
  cliente_id?: number;
  clienteId?: number;
  clienteNombre?: string;
  cliente?: { id?: number; nombres?: string; apellidos?: string };
  raza?: { nombre?: string; nombreRaza?: string };
}

@Component({
  selector: 'app-mascota',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mascota.component.html',
  styleUrl: './mascota.component.scss'
})
export class MascotaComponent implements OnInit {
  clientes: Cliente[] = [];
  mascotas: MascotaItem[] = [];
  mascotasFiltradas: MascotaItem[] = [];
  mascotaSeleccionada: MascotaItem | null = null;

  clienteId: number | null = null;
  mascotaId = '';
  filtro = '';
  cargando = false;
  mensajeError = '';

  pagina = 1;
  tamanoPagina = 8;
  razas: RazaItem[] = [];
  guardandoMascota = false;
  mensajeExito = '';
  nuevaMascota = { nombreMascota: '', edad: '', razaId: '', clienteId: '' };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarMascotas();
    this.cargarRazas();
  }

  cargarRazas(): void {
    this.http.get<RazaItem[]>(`${environment.apiUrlAuth}/gestion/razas`).subscribe({
      next: (razas) => this.razas = razas || [],
      error: (error) => {
        this.mensajeError = error?.error?.message || 'No fue posible cargar las razas.';
      }
    });
  }

  guardarMascota(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    if (!this.nuevaMascota.nombreMascota.trim() || this.nuevaMascota.edad === '' ||
        !this.nuevaMascota.razaId || !this.nuevaMascota.clienteId) {
      this.mensajeError = 'Completa el nombre, la edad, la raza y el cliente de la mascota.';
      return;
    }

    this.guardandoMascota = true;
    this.http.post(`${environment.apiUrlAuth}/mascota/guardar`, {
      nombreMascota: this.nuevaMascota.nombreMascota.trim(),
      edad: Number(this.nuevaMascota.edad),
      razaId: Number(this.nuevaMascota.razaId),
      clienteId: Number(this.nuevaMascota.clienteId)
    }).subscribe({
      next: () => {
        this.guardandoMascota = false;
        this.mensajeExito = 'Mascota registrada correctamente.';
        this.nuevaMascota = { nombreMascota: '', edad: '', razaId: '', clienteId: '' };
        this.cargarMascotas();
      },
      error: (error) => {
        this.guardandoMascota = false;
        this.mensajeError = error?.error?.message || 'No fue posible registrar la mascota.';
      }
    });
  }

  cargarClientes(): void {
    this.http.get<ClienteApiItem[]>(`${environment.apiUrlAuth}/gestion/clientes`).subscribe({
      next: (datos) => {
        this.clientes = (datos || []).map(c => ({
          cliente_id: c.cliente_id ?? c.id,
          nombres: c.nombres,
          apellidos: c.apellidos,
          numero_documento: c.numero_documento ?? c.numeroDocumento
        }));
      },
      error: () => {
        this.mensajeError = 'No fue posible cargar los clientes.';
      }
    });
  }

  cargarMascotas(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.http.get<MascotaItem[]>(`${environment.apiUrlAuth}/gestion/mascotas`).subscribe({
      next: (datos) => {
        this.mascotas = (datos || []).map(m => ({
          ...m,
          mascota_id: m.mascota_id ?? m.mascotaId,
          nombre_mascota: m.nombre_mascota ?? m.nombreMascota,
          cliente_id: m.cliente_id ?? m.clienteId ?? m.cliente?.id,
          clienteNombre: m.cliente
            ? `${m.cliente.nombres || ''} ${m.cliente.apellidos || ''}`.trim()
            : ''
        }));

        this.filtrarMascotas();
        this.cargando = false;
      },
      error: () => {
        this.mensajeError = 'No fue posible cargar las mascotas. Verifica que el backend esté activo.';
        this.cargando = false;
      }
    });
  }

  seleccionarCliente(): void {
    this.mascotaSeleccionada = null;
    this.filtrarMascotas();
  }

  filtrarMascotas(): void {
    const texto = this.filtro.trim().toLowerCase();

    this.mascotasFiltradas = this.mascotas.filter(m => {
      const perteneceCliente =
        this.clienteId === null ||
        Number(m.cliente_id) === Number(this.clienteId);

      const coincideTexto =
        `${m.nombre_mascota || ''} ${m.mascota_id || ''} ${m.clienteNombre || ''}`
          .toLowerCase()
          .includes(texto);

      return perteneceCliente && coincideTexto;
    });

    this.pagina = 1;
  }

  buscarPorId(): void {
    if (!this.mascotaId.trim()) {
      this.mensajeError = 'Ingresa el ID de la mascota.';
      this.mascotaSeleccionada = null;
      return;
    }

    const mascota = this.mascotas.find(m =>
      Number(m.mascota_id) === Number(this.mascotaId)
    );

    if (!mascota) {
      this.mensajeError = 'No se encontró una mascota con ese ID.';
      this.mascotaSeleccionada = null;
      return;
    }

    this.mascotaSeleccionada = mascota;
    this.mensajeError = '';
  }

  verDetalle(mascota: MascotaItem): void {
    this.mascotaSeleccionada = mascota;
    this.mensajeError = '';
  }

  cerrarDetalle(): void {
    this.mascotaSeleccionada = null;
  }

  get mascotasPagina(): MascotaItem[] {
    const inicio = (this.pagina - 1) * this.tamanoPagina;
    return this.mascotasFiltradas.slice(inicio, inicio + this.tamanoPagina);
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.mascotasFiltradas.length / this.tamanoPagina));
  }

  cambiarPagina(valor: number): void {
    if (valor >= 1 && valor <= this.totalPaginas) {
      this.pagina = valor;
    }
  }
}
