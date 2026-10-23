import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Cliente } from 'src/app/models/cliente';
import { environment } from 'src/environments/environment';

interface ClienteApiItem {
  id?: number;
  cliente_id?: number;
  tipoDocumento?: string;
  tipo_documento?: string;
  numeroDocumento?: string;
  numero_documento?: string;
  nombres?: string;
  apellidos?: string;
  fechaNacimiento?: string;
  fecha_nacimiento?: string;
  genero?: string;
  telefono?: string;
  direccion?: string;
  activo?: boolean;
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
  clientesFiltrados: Cliente[] = [];
  clienteSeleccionado: Cliente | null = null;

  filtro = '';
  documento = '';
  cargando = false;
  mensajeError = '';
  pagina = 1;
  tamanoPagina = 8;
  guardandoCliente = false;
  mensajeExito = '';
  nuevoCliente = {
    tipoDocumento: 'CC',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    genero: '',
    telefono: '',
    direccion: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.listarClientes();
  }

  listarClientes(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.http.get<ClienteApiItem[]>(`${environment.apiUrlAuth}/gestion/clientes`).subscribe({
      next: (respuesta) => {
        this.clientes = (respuesta || []).map(c => ({
          cliente_id: c.cliente_id ?? c.id,
          tipo_documento: c.tipo_documento ?? c.tipoDocumento,
          numero_documento: c.numero_documento ?? c.numeroDocumento,
          nombres: c.nombres,
          apellidos: c.apellidos,
          fecha_nacimiento: c.fecha_nacimiento || c.fechaNacimiento
            ? new Date(c.fecha_nacimiento || c.fechaNacimiento!)
            : undefined,
          genero: c.genero,
          telefono: c.telefono,
          direccion: c.direccion,
          activo: c.activo
        }));

        this.filtrarClientes();
        this.cargando = false;
      },
      error: () => {
        this.mensajeError = 'No fue posible cargar los clientes. Verifica que el backend esté activo.';
        this.cargando = false;
      }
    });
  }

  guardarCliente(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    if (!this.nuevoCliente.tipoDocumento || !this.nuevoCliente.numeroDocumento.trim() ||
        !this.nuevoCliente.nombres.trim() || !this.nuevoCliente.apellidos.trim()) {
      this.mensajeError = 'Completa tipo y número de documento, nombres y apellidos.';
      return;
    }

    this.guardandoCliente = true;
    this.http.post(`${environment.apiUrlAuth}/gestion/clientes`, {
      ...this.nuevoCliente,
      numeroDocumento: this.nuevoCliente.numeroDocumento.trim(),
      nombres: this.nuevoCliente.nombres.trim(),
      apellidos: this.nuevoCliente.apellidos.trim(),
      fechaNacimiento: this.nuevoCliente.fechaNacimiento || null
    }).subscribe({
      next: () => {
        this.guardandoCliente = false;
        this.mensajeExito = 'Cliente registrado correctamente.';
        this.nuevoCliente = {
          tipoDocumento: 'CC',
          numeroDocumento: '',
          nombres: '',
          apellidos: '',
          fechaNacimiento: '',
          genero: '',
          telefono: '',
          direccion: ''
        };
        this.listarClientes();
      },
      error: (error) => {
        this.guardandoCliente = false;
        this.mensajeError = error?.error?.message || 'No fue posible registrar el cliente.';
      }
    });
  }

  filtrarClientes(): void {
    const texto = this.filtro.trim().toLowerCase();

    this.clientesFiltrados = this.clientes.filter(c =>
      `${c.nombres || ''} ${c.apellidos || ''} ${c.numero_documento || ''}`
        .toLowerCase()
        .includes(texto)
    );

    this.pagina = 1;
  }

  buscarPorDocumento(): void {
    const numero = this.documento.trim();

    if (!numero) {
      this.mensajeError = 'Ingresa el número de documento.';
      this.clienteSeleccionado = null;
      return;
    }

    const cliente = this.clientes.find(c =>
      String(c.numero_documento ?? '') === numero
    );

    this.clienteSeleccionado = cliente || null;
    this.mensajeError = cliente ? '' : 'No se encontró un cliente con ese documento.';
  }

  verDetalle(cliente: Cliente): void {
    this.clienteSeleccionado = cliente;
    this.mensajeError = '';
  }

  get clientesPagina(): Cliente[] {
    const inicio = (this.pagina - 1) * this.tamanoPagina;
    return this.clientesFiltrados.slice(inicio, inicio + this.tamanoPagina);
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.clientesFiltrados.length / this.tamanoPagina));
  }

  cambiarPagina(valor: number): void {
    if (valor >= 1 && valor <= this.totalPaginas) {
      this.pagina = valor;
    }
  }

  cerrarDetalle(): void {
    this.clienteSeleccionado = null;
  }
}
