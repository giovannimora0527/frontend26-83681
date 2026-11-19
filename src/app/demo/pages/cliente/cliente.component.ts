import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cliente } from 'src/app/models/cliente';
import { ClienteService } from './service/cliente.service';

@Component({
  selector: 'app-cliente',
  imports: [CommonModule, FormsModule],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.scss'
})
export class ClienteComponent {
  /** Clientes recibidos desde el servicio REST de la clínica. */
  clientes: Cliente[] = [];
  busqueda = '';
  paginaActual = 1;
  readonly tamanoPagina = 8;
  cargando = false;
  error = '';

  constructor(private readonly clienteService: ClienteService) {
    this.listar();
  }

  /** Consulta el catálogo y reinicia la paginación al actualizarlo. */
  listar(): void {
    this.cargando = true;
    this.error = '';
    this.clienteService.listarClientes().subscribe({
      next: (respuesta) => {
        this.clientes = Array.isArray(respuesta) ? respuesta : [];
        this.paginaActual = 1;
        this.cargando = false;
      },
      error: (err: { status?: number }) => {
        this.error = this.mensajeError(err.status);
        this.cargando = false;
        console.error('Error al consultar clientes:', err);
      }
    });
  }

  /** Filtra clientes por nombre, documento, teléfono o dirección. */
  get clientesFiltrados(): Cliente[] {
    const criterio = this.normalizar(this.busqueda.trim());
    return this.clientes.filter((cliente) => !criterio || this.normalizar([
      cliente.nombres, cliente.apellidos, cliente.tipoDocumento, cliente.numeroDocumento,
      cliente.telefono, cliente.direccion
    ].join(' ')).includes(criterio));
  }

  /** Recorta los resultados a la página visible. */
  get clientesPaginados(): Cliente[] {
    const inicio = (this.paginaActual - 1) * this.tamanoPagina;
    return this.clientesFiltrados.slice(inicio, inicio + this.tamanoPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, indice) => indice + 1);
  }

  get totalPaginas(): number {
    return Math.ceil(this.clientesFiltrados.length / this.tamanoPagina);
  }

  cambiarBusqueda(valor: string): void {
    this.busqueda = valor;
    this.paginaActual = 1;
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) this.paginaActual = pagina;
  }

  obtenerEstado(cliente: Cliente): string {
    return cliente.activo === false ? 'Inactivo' : 'Activo';
  }

  private normalizar(valor: string): string {
    return valor.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private mensajeError(status?: number): string {
    if (status === 0) return 'No se pudo conectar con el servidor. Verifica que el backend esté activo.';
    if (status === 401) return 'La sesión venció o no es válida. Inicia sesión nuevamente.';
    if (status === 403) return 'Tu rol no tiene permiso para consultar los clientes.';
    return `No fue posible cargar los clientes (HTTP ${status ?? 'desconocido'}).`;
  }
}
