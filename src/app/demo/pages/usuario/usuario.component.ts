import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Usuario } from 'src/app/models/usuario';
import { UsuarioActualizacion, UsuarioService } from './service/usuario.service';
import { getJwtPayload } from 'src/app/utils/jwt.util';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuario',
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.scss'
})
export class UsuarioComponent {
  /** Usuarios devueltos por el endpoint de administración, sin exponer contraseñas. */
  usuarios: Usuario[] = [];
  busqueda = '';
  paginaActual = 1;
  readonly tamanoPagina = 8;
  cargando = false;
  error = '';
  usuarioActualizandoId: number | null = null;
  readonly esAdministrador = this.normalizar(getJwtPayload()?.rol ?? '') === 'administrador'
    || this.normalizar(getJwtPayload()?.rol ?? '') === 'admin';

  constructor(private readonly usuarioService: UsuarioService) {
    this.listar();
  }

  /** Recupera la lista de usuarios desde la API protegida. */
  listar(): void {
    this.cargando = true;
    this.error = '';
    this.usuarioService.getUsuarios().subscribe({
      next: (respuesta) => {
        this.usuarios = Array.isArray(respuesta) ? respuesta : [];
        this.paginaActual = 1;
        this.cargando = false;
      },
      error: (err: { status?: number }) => {
        this.error = this.mensajeError(err.status);
        this.cargando = false;
        console.error('Error al consultar usuarios:', err);
      }
    });
  }

  /** Filtra por nombre de usuario, correo, rol o estado. */
  get usuariosFiltrados(): Usuario[] {
    const criterio = this.normalizar(this.busqueda.trim());
    return this.usuarios.filter((usuario) => !criterio || this.normalizar([
      usuario.username, usuario.email, usuario.rol, this.obtenerEstado(usuario)
    ].join(' ')).includes(criterio));
  }

  /** Devuelve únicamente los registros de la página actual. */
  get usuariosPaginados(): Usuario[] {
    const inicio = (this.paginaActual - 1) * this.tamanoPagina;
    return this.usuariosFiltrados.slice(inicio, inicio + this.tamanoPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, indice) => indice + 1);
  }

  get totalPaginas(): number {
    return Math.ceil(this.usuariosFiltrados.length / this.tamanoPagina);
  }

  cambiarBusqueda(valor: string): void {
    this.busqueda = valor;
    this.paginaActual = 1;
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) this.paginaActual = pagina;
  }

  obtenerEstado(usuario: Usuario): string {
    return usuario.activo === false ? 'Inactivo' : 'Activo';
  }

  /** Solicita confirmación y activa o inactiva la cuenta con el endpoint de actualización. */
  async cambiarEstado(usuario: Usuario): Promise<void> {
    if (!this.esAdministrador || !usuario.id || !usuario.username || !usuario.email || this.usuarioActualizandoId !== null) {
      return;
    }

    const nuevoEstado = usuario.activo === false;
    const accion = nuevoEstado ? 'activar' : 'inactivar';
    const confirmacion = await Swal.fire({
      title: `¿Deseas ${accion} esta cuenta?`,
      text: `${usuario.username} quedará ${nuevoEstado ? 'activa' : 'inactiva'} después de confirmar.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar'
    });
    if (!confirmacion.isConfirmed) return;

    const perfilId = this.obtenerPerfilId(usuario.rol ?? '');
    if (perfilId === null) {
      await Swal.fire('No se pudo actualizar', 'El rol de este usuario no está asociado a un perfil conocido.', 'error');
      return;
    }

    const solicitud: UsuarioActualizacion = {
      id: usuario.id,
      username: usuario.username,
      email: usuario.email,
      perfilId,
      activo: nuevoEstado
    };
    this.usuarioActualizandoId = usuario.id;
    this.usuarioService.actualizarUsuario(solicitud).subscribe({
      next: async () => {
        this.usuarioActualizandoId = null;
        await Swal.fire('Estado actualizado', `La cuenta quedó ${nuevoEstado ? 'activa' : 'inactiva'}.`, 'success');
        this.listar();
      },
      error: async (error: { status?: number; error?: { mensaje?: string; message?: string } }) => {
        this.usuarioActualizandoId = null;
        const mensaje = error.error?.mensaje ?? error.error?.message ?? this.mensajeError(error.status);
        await Swal.fire('No se pudo actualizar', mensaje, 'error');
        console.error('Error al cambiar el estado del usuario:', error);
      }
    });
  }

  /** Resuelve el ID de perfil requerido por la API a partir de los perfiles del sistema. */
  private obtenerPerfilId(rol: string): number | null {
    const rolNormalizado = this.normalizar(rol).replace(/[\s-]+/g, '_').toUpperCase();
    const perfiles: Record<string, number> = {
      ADMIN: 1,
      ADMINISTRADOR: 1,
      RECEPCION: 2,
      RECEPCIONISTA: 2,
      MEDICO: 3,
      VETERINARIO: 3,
      DESPACHO_MEDICO: 4
    };
    return perfiles[rolNormalizado] ?? null;
  }

  private normalizar(valor: string): string {
    return valor.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private mensajeError(status?: number): string {
    if (status === 0) return 'No se pudo conectar con el servidor. Verifica que el backend esté activo.';
    if (status === 401) return 'La sesión venció o no es válida. Inicia sesión nuevamente.';
    if (status === 403) return 'Tu rol no tiene permiso para consultar los usuarios.';
    return `No fue posible cargar los usuarios (HTTP ${status ?? 'desconocido'}).`;
  }
}
