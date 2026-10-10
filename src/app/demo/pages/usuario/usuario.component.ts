import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from 'src/app/models/usuario';
import { UsuarioService } from './service/usuario.service';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.scss'
})
export class UsuarioComponent implements OnInit {
  listUsuarios: Usuario[] = [];
  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 10;
  cargando = false;
  mensajeError = '';

  constructor(private readonly usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.listar();
  }

  get usuariosFiltrados(): Usuario[] {
    const termino = this.normalizar(this.terminoBusqueda.trim());
    if (!termino) {
      return this.listUsuarios;
    }

    return this.listUsuarios.filter((usuario) =>
      [
        usuario.id,
        usuario.username,
        usuario.email,
        usuario.rol,
        usuario.fechaCreacion,
        usuario.activo === undefined ? '' : usuario.activo ? 'activo' : 'inactivo'
      ].some((valor) => this.normalizar(String(valor ?? '')).includes(termino))
    );
  }

  get usuariosPaginados(): Usuario[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.usuariosFiltrados.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.usuariosFiltrados.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, indice) => indice + 1);
  }

  listar(): void {
    this.cargando = true;
    this.mensajeError = '';
    this.usuarioService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.listUsuarios = usuarios;
        this.paginaActual = 1;
        this.cargando = false;
      },
      error: (error: unknown) => {
        this.cargando = false;
        this.mensajeError = this.obtenerMensajeError(error);
      }
    });
  }

  actualizarBusqueda(event: Event): void {
    this.terminoBusqueda = (event.target as HTMLInputElement).value;
    this.paginaActual = 1;
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  mostrarFecha(fecha?: Date | string): string {
    if (!fecha) {
      return '—';
    }
    const valor = new Date(fecha);
    return Number.isNaN(valor.getTime()) ? '—' : valor.toLocaleString();
  }

  private normalizar(valor: string): string {
    return valor.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private obtenerMensajeError(error: unknown): string {
    if (error && typeof error === 'object') {
      const respuesta = error as { error?: { message?: string; error?: string } };
      return respuesta.error?.message
        ?? respuesta.error?.error
        ?? 'No fue posible cargar los usuarios. Verifica la conexión con el backend e inténtalo de nuevo.';
    }
    return 'No fue posible cargar los usuarios. Verifica la conexión con el backend e inténtalo de nuevo.';
  }
}
