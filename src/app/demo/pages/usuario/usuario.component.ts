import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';

import { UsuarioService } from './service/usuario.service';
import { Usuario } from 'src/app/models/usuario';
import { UsuarioRq } from 'src/app/models/requests';

import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-usuario',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.scss'
})
export class UsuarioComponent {
  // Variables para el modal.
  modalInstance: Modal | null = null;
  titleModal = '';
  modoFormulario = '';
  titleBoton = '';

  // Variables para la paginación y búsqueda en la datatable.
  listUsuarios: Usuario[] = [];
  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 10;

  // Formulario para crear o editar usuario.
  form!: FormGroup;
  usuarioSelected: Usuario | null = null;

  constructor(private readonly usuarioService: UsuarioService,
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute) {
    this.leerFiltroDeUrl();
    this.listar();
    this.inicializarFormulario();
  }

  // Metodo que permite inicializar el formulario con sus controles y validaciones.
  inicializarFormulario() {
    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      rol: ['', Validators.required],
      activo: [true]
    });
  }

  // Obtiene los controles del formulario para facilitar el acceso a sus propiedades y métodos.
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  // Filtra la lista de usuarios según el término de búsqueda ingresado por el usuario.
  get usuariosFiltrados(): Usuario[] {
    const termino = this.normalizarTexto(this.terminoBusqueda.trim());
    if (!termino) {
      return this.listUsuarios;
    }

    return this.listUsuarios.filter((usuario) =>
      [usuario.username, usuario.email, usuario.rol].some((valor) =>
        this.normalizarTexto(String(valor ?? '')).includes(termino)
      )
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

  // Metodo que permite listar los usuarios registrados en la base de datos.
  listar() {
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        this.listUsuarios = data;
        this.paginaActual = 1;
      },
      error: (error) => {
        console.error('Error al obtener los usuarios:', error);
      }
    });
  }

  // Si se llega desde la lupa del menu superior (?buscar=...), la tabla se abre ya filtrada.
  private leerFiltroDeUrl() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const buscar = params.get('buscar');
      if (buscar !== null) {
        this.terminoBusqueda = buscar;
        this.paginaActual = 1;
      }
    });
  }

  // Metodo que actualiza el termino de busqueda y reinicia la pagina actual a 1.
  actualizarBusqueda(event: Event) {
    this.terminoBusqueda = (event.target as HTMLInputElement).value;
    this.paginaActual = 1;
  }

  // Cambia paginacion.
  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  // Busca otro usuario que ya tenga el mismo username o email.
  private buscarDuplicado(username: string, email: string): string | null {
    const otros = this.listUsuarios.filter((usuario) => usuario.id !== this.usuarioSelected?.id);
    if (otros.some((usuario) => this.normalizarTexto(usuario.username ?? '') === this.normalizarTexto(username))) {
      return `Ya existe un usuario con el nombre de usuario "${username}".`;
    }
    if (otros.some((usuario) => this.normalizarTexto(usuario.email ?? '') === this.normalizarTexto(email))) {
      return `Ya existe un usuario con el email "${email}".`;
    }
    return null;
  }

  // Crea o actualiza el usuario dependiendo del modo del formulario.
  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.value;
    const username = valores.username.trim();
    const email = valores.email.trim();

    const duplicado = this.buscarDuplicado(username, email);
    if (duplicado) {
      Swal.fire('Registro duplicado', duplicado, 'warning');
      return;
    }

    // En edicion, si la contraseña se deja vacia se conserva la actual.
    const usuario: UsuarioRq = {
      id: this.usuarioSelected?.id,
      username,
      email,
      password: valores.password || undefined,
      rol: valores.rol.trim(),
      activo: !!valores.activo
    };

    const peticion = this.modoFormulario === 'C'
      ? this.usuarioService.crearUsuario(usuario)
      : this.usuarioService.actualizarUsuario(usuario);

    peticion.subscribe({
      next: () => {
        Swal.fire('Éxito', this.modoFormulario === 'C' ? 'Usuario creado correctamente.' : 'Usuario actualizado correctamente.', 'success');
        this.closeModal();
        this.listar();
      },
      error: (error) => {
        console.error('Error al guardar el usuario:', error);
        Swal.fire('Error', error?.error?.message ?? 'No fue posible guardar el usuario.', 'error');
      }
    });
  }

  // Solicita confirmación y elimina el usuario seleccionado.
  eliminar(usuario: Usuario) {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: `Se eliminará el usuario "${usuario.username}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((resultado) => {
      if (!resultado.isConfirmed) {
        return;
      }
      this.usuarioService.eliminarUsuario(usuario.id!).subscribe({
        next: () => {
          Swal.fire('Eliminado', 'El usuario fue eliminado correctamente.', 'success');
          this.listar();
        },
        error: (error) => {
          console.error('Error al eliminar el usuario:', error);
          Swal.fire('Error', error?.error?.message ?? 'No fue posible eliminar el usuario.', 'error');
        }
      });
    });
  }

  // Evento para abrir el modal de crear usuario. La contraseña es obligatoria al crear.
  nuevoUsuario() {
    this.usuarioSelected = null;
    this.resetFormulario();
    this.f['password'].setValidators([Validators.required, Validators.minLength(6)]);
    this.f['password'].updateValueAndValidity();
    this.openModal('C');
  }

  // Al editar, la contraseña es opcional.
  abrirEdicion(usuario: Usuario) {
    this.usuarioSelected = usuario;
    this.resetFormulario();
    this.f['password'].setValidators(Validators.minLength(6));
    this.f['password'].updateValueAndValidity();
    this.form.patchValue({
      username: usuario.username,
      email: usuario.email,
      rol: usuario.rol,
      activo: usuario.activo
    });
    this.openModal('E');
  }

  resetFormulario() {
    this.form.reset({ activo: true });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.resetFormulario();
  }

  openModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear Usuario' : 'Editar Usuario';
    this.titleBoton = modo === 'C' ? 'Guardar Usuario' : 'Actualizar Usuario';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalUsuario');
    if (modalElement) {
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }

  // Metodo privado para normalizar el texto, eliminando acentos y convirtiendo a minúsculas.
  private normalizarTexto(texto: string): string {
    return texto
      .trim()
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }
}
