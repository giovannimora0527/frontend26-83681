import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Modal } from 'bootstrap';
import { Usuario } from 'src/app/models/usuario';
import { mensajeDeError } from 'src/app/services/api.util';
import { UsuarioRq, UsuarioService } from './service/usuario.service';

@Component({
  selector: 'app-usuario',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.scss'
})
export class UsuarioComponent {
  usuarios: Usuario[] = [];
  cargando = false;
  mensajeLista: { tipo: 'success' | 'danger'; texto: string } | null = null;

  /** Roles que reconoce el sistema (los que existen en la base de datos). */
  readonly roles = ['ADMIN', 'MEDICO'];

  modalInstance: Modal | null = null;
  guardando = false;
  avisoFormulario: string | null = null;

  readonly usuarioForm = new FormGroup({
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-Za-z0-9._-]+$/)]
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(255)]
    }),
    rol: new FormControl('MEDICO', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6), Validators.maxLength(100)]
    }),
    activo: new FormControl(true, { nonNullable: true })
  });

  constructor(private readonly usuarioService: UsuarioService) {
    this.listar();
  }

  /** Carga la lista de usuarios desde el backend. */
  listar() {
    this.cargando = true;
    this.usuarioService.listar().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        this.mensajeLista = { tipo: 'danger', texto: mensajeDeError(error) };
      }
    });
  }

  /** Abre el formulario de nuevo usuario con los valores por defecto. */
  nuevoUsuario() {
    this.mensajeLista = null;
    this.avisoFormulario = null;
    this.usuarioForm.reset({ rol: 'MEDICO', activo: true });
    this.openModal();
  }

  /** Valida y crea el usuario. */
  guardar() {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      this.avisoFormulario = 'Complete los campos obligatorios. El usuario solo admite letras, números, punto, guion y guion bajo; la contraseña debe tener al menos 6 caracteres.';
      return;
    }

    const v = this.usuarioForm.getRawValue();
    const rq: UsuarioRq = {
      username: v.username.trim(),
      password: v.password,
      rol: v.rol,
      email: v.email.trim(),
      activo: v.activo
    };

    this.guardando = true;
    this.avisoFormulario = null;
    this.usuarioService.crear(rq).subscribe({
      next: (respuesta) => {
        this.guardando = false;
        this.closeModal();
        this.mensajeLista = { tipo: 'success', texto: respuesta.message };
        this.listar();
      },
      error: (error) => {
        this.guardando = false;
        this.avisoFormulario = mensajeDeError(error);
      }
    });
  }

  closeModal() {
    this.modalInstance?.hide();
  }

  private openModal() {
    const modalElement = document.getElementById('modalCrearUsuario');
    if (modalElement) {
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }
}
