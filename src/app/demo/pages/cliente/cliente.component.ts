import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cliente } from 'src/app/models/cliente';
import { ClienteService } from './service/cliente.service';
// Importa los objetos necesarios de Bootstrap
declare var bootstrap: any;

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

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.listarClientes();
  }

  listarClientes(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.clienteService.getClientes().subscribe({
      next: (respuesta: any[]) => {
        this.clientes = (respuesta || []).map(c => ({
          ...c,
          cliente_id: c.cliente_id ?? c.id,
          tipo_documento: c.tipo_documento ?? c.tipoDocumento,
          numero_documento: c.numero_documento ?? c.numeroDocumento,
          fecha_nacimiento: c.fecha_nacimiento ?? c.fechaNacimiento
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
