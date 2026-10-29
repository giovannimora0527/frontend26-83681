import { Component } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Modal } from 'bootstrap';
import Swal from 'sweetalert2';

import { Usuario } from 'src/app/models/usuario';
import { UsuarioService } from './service/usuario.service';

type ColumnaOrden = 'userName' | 'email' | 'rol' | 'activo' | 'fechaCreacion';

/**
 * Componente de gestión de usuarios: listado paginado con búsqueda y ordenamiento,
 * creación y edición mediante un modal con formulario reactivo.
 */
@Component({
  selector: 'app-usuario',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbTooltipModule],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.scss'
})
export class UsuarioComponent {
  // Variables para el modal.
  modalInstance: Modal | null = null;
  titleModal: string = '';
  modoFormulario: string = '';
  titleBoton: string = '';

  // Variables para la paginación, ordenamiento y búsqueda en la datatable.
  listUsuarios: Usuario[] = [];
  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 10;
  columnaOrden: ColumnaOrden = 'userName';
  direccionOrden: 'asc' | 'desc' = 'asc';
  cargando = false;
  errorLista = '';

  /** Roles disponibles para asignar a un usuario. */
  readonly roles = ['ADMIN', 'VETERINARIO', 'RECEPCIONISTA'];

  // Formulario para crear o editar usuario.
  form!: FormGroup;
  usuarioSelected: Usuario | null = null;
  enviando = false;
  respuestaError = '';

  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly formBuilder: FormBuilder
  ) {
    this.inicializarFormulario();
    this.listar();
  }

  /** Inicializa el formulario con sus controles y validaciones. */
  inicializarFormulario(): void {
    this.form = this.formBuilder.group({
      userName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      rol: [null, Validators.required],
      password: [''],
      activo: [true]
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  /** Filtra y ordena según el término de búsqueda y la columna activa. */
  get usuariosFiltrados(): Usuario[] {
    const termino = this.normalizarTexto(this.terminoBusqueda.trim());
    const filtradas = this.listUsuarios.filter((usuario) => {
      if (!termino) {
        return true;
      }
      const valores = [
        usuario.userName,
        usuario.email,
        usuario.rol,
        usuario.activo ? 'activo' : 'inactivo',
        usuario.fechaCreacion ? formatDate(usuario.fechaCreacion, 'yyyy-MM-dd HH:mm', 'en-US') : ''
      ];
      return valores.some((valor) => this.normalizarTexto(String(valor ?? '')).includes(termino));
    });

    return [...filtradas].sort((a, b) => {
      const valorA = this.obtenerValorOrden(a, this.columnaOrden);
      const valorB = this.obtenerValorOrden(b, this.columnaOrden);
      const comparacion = typeof valorA === 'number' && typeof valorB === 'number'
        ? valorA - valorB
        : String(valorA).localeCompare(String(valorB), 'es', { numeric: true, sensitivity: 'base' });
      return this.direccionOrden === 'asc' ? comparacion : -comparacion;
    });
  }

  private obtenerValorOrden(usuario: Usuario, columna: ColumnaOrden): string | number {
    switch (columna) {
      case 'userName':
        return usuario.userName ?? '';
      case 'email':
        return usuario.email ?? '';
      case 'rol':
        return usuario.rol ?? '';
      case 'activo':
        return usuario.activo ? 1 : 0;
      case 'fechaCreacion':
        return usuario.fechaCreacion ? new Date(usuario.fechaCreacion).getTime() : 0;
    }
  }

  ordenarPor(columna: ColumnaOrden): void {
    if (this.columnaOrden === columna) {
      this.direccionOrden = this.direccionOrden === 'asc' ? 'desc' : 'asc';
    } else {
      this.columnaOrden = columna;
      this.direccionOrden = 'asc';
    }
    this.paginaActual = 1;
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

  /** Lista los registros de la base de datos y los muestra en la tabla. */
  listar(): void {
    this.cargando = true;
    this.errorLista = '';
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        this.listUsuarios = data ?? [];
        this.paginaActual = 1;
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        this.errorLista = this.mensajeError(error, 'No fue posible cargar los usuarios.');
      }
    });
  }

  // Actualiza el término de búsqueda y reinicia la página actual a 1.
  actualizarBusqueda(event: Event): void {
    this.terminoBusqueda = (event.target as HTMLInputElement).value;
    this.paginaActual = 1;
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  // Normaliza el texto eliminando acentos y convirtiendo a minúsculas.
  private normalizarTexto(texto: string): string {
    return texto
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /** Abre el modal en modo creación ('C'). */
  nuevoUsuario(modo: string): void {
    this.modoFormulario = modo;
    this.usuarioSelected = null;
    this.resetFormulario();
    this.configurarPassword(true);
    this.openModal(modo);
  }

  resetFormulario(): void {
    this.form.reset({ userName: '', email: '', rol: null, password: '', activo: true });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.respuestaError = '';
  }

  /** Abre el modal en modo edición con los datos del registro seleccionado. */
  abrirEdicion(usuario: Usuario): void {
    this.usuarioSelected = usuario;
    this.modoFormulario = 'E';
    this.respuestaError = '';
    this.form.reset({
      userName: usuario.userName ?? '',
      email: usuario.email ?? '',
      rol: usuario.rol ?? null,
      password: '',
      activo: usuario.activo ?? true
    });
    this.configurarPassword(false);
    this.openModal(this.modoFormulario);
  }

  /**
   * Ajusta las validaciones de la contraseña: obligatoria al crear y opcional al editar
   * (si se deja vacía, se conserva la contraseña actual).
   */
  private configurarPassword(obligatoria: boolean): void {
    const control = this.form.get('password');
    control?.setValidators(obligatoria
      ? [Validators.required, Validators.minLength(6)]
      : [Validators.minLength(6)]);
    control?.updateValueAndValidity();
  }

  /** Crea o actualiza el registro según el modo del formulario. */
  guardarUsuario(): void {
    if (this.form.invalid || this.enviando) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const usuario: Usuario = {
      id: this.usuarioSelected?.id,
      userName: String(valores.userName).trim(),
      email: String(valores.email).trim(),
      rol: valores.rol,
      activo: Boolean(valores.activo),
      // En edición la contraseña es opcional: si va vacía, el backend conserva la actual.
      password: String(valores.password ?? '')
    };

    this.enviando = true;
    this.respuestaError = '';
    const solicitud = this.modoFormulario === 'C'
      ? this.usuarioService.crearUsuario(usuario)
      : this.usuarioService.actualizarUsuario(usuario);

    solicitud.subscribe({
      next: (respuesta) => {
        this.enviando = false;
        const mensaje = this.obtenerMensajeRespuesta(
          respuesta,
          this.modoFormulario === 'C' ? 'El usuario fue creado correctamente.' : 'El usuario fue actualizado correctamente.'
        );
        this.closeModal();
        this.listar();
        Swal.fire('Operación exitosa', mensaje, 'success');
      },
      error: (error) => {
        this.enviando = false;
        this.respuestaError = this.mensajeError(error, 'No fue posible guardar el usuario.');
      }
    });
  }

  private obtenerMensajeRespuesta(respuesta: unknown, mensajePredeterminado: string): string {
    if (respuesta && typeof respuesta === 'object') {
      const cuerpo = respuesta as { mensaje?: unknown; message?: unknown };
      const mensaje = cuerpo.mensaje ?? cuerpo.message;
      if (typeof mensaje === 'string') {
        return mensaje;
      }
    }
    return mensajePredeterminado;
  }

  /** Extrae un mensaje comprensible del error devuelto por el backend. */
  private mensajeError(error: unknown, predeterminado: string): string {
    if (error && typeof error === 'object') {
      const respuesta = error as { status?: number; error?: { message?: unknown } };
      if (respuesta.status === 0) {
        return 'No fue posible comunicarse con el servidor. Intenta de nuevo más tarde.';
      }
      const mensaje = respuesta.error?.message;
      if (typeof mensaje === 'string' && mensaje.trim()) {
        return mensaje;
      }
    }
    return predeterminado;
  }

  closeModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.resetFormulario();
  }

  openModal(modo: string): void {
    this.titleModal = modo === 'C' ? 'Crear Usuario' : 'Editar Usuario';
    this.titleBoton = modo === 'C' ? 'Guardar Usuario' : 'Actualizar Usuario';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearUsuario');
    if (modalElement) {
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }
}
