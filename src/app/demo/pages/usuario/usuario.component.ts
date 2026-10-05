import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from 'src/app/models/usuario';
import { UsuarioService } from './service/usuario.service';
import { TablaPaginada } from 'src/app/theme/shared/helpers/tabla-paginada';
import { PaginacionComponent } from 'src/app/theme/shared/components/paginacion/paginacion.component';

import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-usuario',
  imports: [CommonModule, ReactiveFormsModule, PaginacionComponent],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.scss'
})
export class UsuarioComponent {
  modalInstance: Modal | null = null;
  titleModal = '';
  titleBoton = '';
  modoFormulario = '';

  readonly roles = [
    { valor: 'ADMIN', texto: 'Administrador', color: 'bg-danger' },
    { valor: 'MEDICO', texto: 'Médico', color: 'bg-primary' },
    { valor: 'RECEPCIONISTA', texto: 'Recepcionista', color: 'bg-info' }
  ];

  readonly tabla = new TablaPaginada<Usuario>((usuario) => [usuario.username, usuario.email, this.rol(usuario.rol)?.texto]);

  form!: FormGroup;
  usuarioSelected: Usuario | null = null;
  guardando = false;
  verPassword = false;

  constructor(private readonly usuarioService: UsuarioService,
    private readonly formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]{4,30}$/)]],
      email: ['', [Validators.required, Validators.email]],
      rol: ['', Validators.required],
      password: [''],
      activo: [true]
    });
    this.listar();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  rol(valor?: string) {
    return this.roles.find((rol) => rol.valor === valor);
  }

  listar() {
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => this.tabla.cargar(data),
      error: (error) => console.error('Error al obtener los usuarios:', error)
    });
  }

  nuevoUsuario() {
    this.usuarioSelected = null;
    this.form.reset({ username: '', email: '', rol: '', password: '', activo: true });
    // Al crear, la contraseña es obligatoria.
    this.f['password'].setValidators([Validators.required, Validators.minLength(8)]);
    this.f['password'].updateValueAndValidity();
    this.openModal('C');
  }

  abrirEdicion(usuario: Usuario) {
    this.usuarioSelected = usuario;
    this.form.reset({ username: usuario.username, email: usuario.email, rol: usuario.rol, password: '', activo: usuario.activo ?? true });
    // Al editar, la contraseña es opcional: vacía significa "no cambiarla".
    this.f['password'].setValidators(Validators.minLength(8));
    this.f['password'].updateValueAndValidity();
    this.openModal('E');
  }

  openModal(modo: string) {
    this.modoFormulario = modo;
    this.verPassword = false;
    this.titleModal = modo === 'C' ? 'Crear Usuario' : 'Editar Usuario';
    this.titleBoton = modo === 'C' ? 'Guardar Usuario' : 'Actualizar Usuario';
    const modalElement = document.getElementById('modalUsuario');
    if (modalElement) {
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }

  closeModal() {
    this.modalInstance?.hide();
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valores = this.form.value;
    const usuario: Usuario = {
      ...this.usuarioSelected,
      username: valores.username.trim(),
      email: valores.email.trim().toLowerCase(),
      rol: valores.rol,
      activo: !!valores.activo
    };
    const peticion = this.modoFormulario === 'C'
      ? this.usuarioService.guardarUsuario(usuario, valores.password)
      : this.usuarioService.actualizarUsuario(usuario, valores.password || undefined);

    this.guardando = true;
    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.closeModal();
        this.listar();
        Swal.fire({ icon: 'success', title: this.modoFormulario === 'C' ? 'Usuario creado' : 'Usuario actualizado', timer: 1800, showConfirmButton: false });
      },
      error: (error) => {
        this.guardando = false;
        console.error('Error al guardar el usuario:', error);
        Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: 'Intenta de nuevo más tarde.' });
      }
    });
  }
}
