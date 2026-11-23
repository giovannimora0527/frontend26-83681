import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
<<<<<<< HEAD
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Usuario } from 'src/app/models/usuario';
import { PerfilUsuario, UsuarioRequest, UsuarioService } from './service/usuario.service';
=======
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Modal } from 'bootstrap';
import { Usuario } from 'src/app/models/usuario';
import { mensajeDeError } from 'src/app/services/api.util';
import { UsuarioRq, UsuarioService } from './service/usuario.service';
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3

@Component({
  selector: 'app-usuario',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.scss'
})
<<<<<<< HEAD
export class UsuarioComponent implements OnInit {
  usuarios: Usuario[] = [];
  perfiles: PerfilUsuario[] = [];
  cargando = false;
  guardando = false;
  mostrarFormulario = false;
  usuarioEditando?: Usuario;

  formulario = this.fb.group({
    username: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    perfilId: [null as number | null, Validators.required],
    password: ['', [Validators.minLength(6), Validators.maxLength(72)]],
    confirmarPassword: [''],
    activo: [true]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly usuarioService: UsuarioService
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.usuarioService.getPerfiles().subscribe({
      next: perfiles => {
        this.perfiles = perfiles;
        this.usuarioService.getUsuarios().subscribe({
          next: usuarios => {
            this.usuarios = usuarios;
            this.cargando = false;
          },
          error: err => this.mostrarError(err, 'No fue posible cargar los usuarios')
        });
      },
      error: err => this.mostrarError(err, 'No fue posible cargar los roles')
    });
  }

  nuevoUsuario(): void {
    this.usuarioEditando = undefined;
    this.formulario.reset({ username: '', email: '', perfilId: null, password: '', confirmarPassword: '', activo: true });
    this.formulario.controls.password.setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(72)]);
    this.formulario.controls.password.updateValueAndValidity();
    this.mostrarFormulario = true;
  }

  editarUsuario(usuario: Usuario): void {
    this.usuarioEditando = usuario;
    const perfil = this.perfiles.find(item => item.nombre === usuario.rol);
    this.formulario.reset({
      username: usuario.username ?? '',
      email: usuario.email ?? '',
      perfilId: perfil?.id ?? null,
      password: '',
      confirmarPassword: '',
      activo: usuario.activo ?? true
    });
    this.formulario.controls.password.setValidators([Validators.minLength(6), Validators.maxLength(72)]);
    this.formulario.controls.password.updateValueAndValidity();
    this.mostrarFormulario = true;
  }

  cancelarEdicion(): void {
    this.mostrarFormulario = false;
    this.usuarioEditando = undefined;
    this.formulario.reset({ username: '', email: '', perfilId: null, password: '', confirmarPassword: '', activo: true });
  }

  guardarUsuario(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    const password = valores.password ?? '';
    if ((!this.usuarioEditando && password !== (valores.confirmarPassword ?? ''))
        || (password.length > 0 && password !== (valores.confirmarPassword ?? ''))) {
      void Swal.fire({ icon: 'warning', title: 'Revisa la contraseña', text: 'Las contraseñas no coinciden.' });
      return;
    }

    const perfil = this.perfiles.find(item => item.id === valores.perfilId);
    if (!perfil) {
      this.formulario.controls.perfilId.markAsTouched();
      return;
    }

    const request: UsuarioRequest = {
      id: this.usuarioEditando?.id,
      username: (valores.username ?? '').trim(),
      email: (valores.email ?? '').trim(),
      password: password || null,
      rol: perfil.nombre,
      perfilId: perfil.id,
      activo: this.usuarioEditando ? Boolean(valores.activo) : true
    };

    this.guardando = true;
    const operacion = this.usuarioEditando
      ? this.usuarioService.actualizarUsuario(request)
      : this.usuarioService.crearUsuario(request);
    operacion.subscribe({
      next: respuesta => {
        this.guardando = false;
        void Swal.fire({ icon: 'success', title: 'Listo', text: respuesta.message });
        this.cancelarEdicion();
        this.cargarDatos();
      },
      error: err => {
        this.guardando = false;
        this.mostrarError(err, 'No fue posible guardar el usuario');
=======
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
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
      }
    });
  }

<<<<<<< HEAD
  private mostrarError(error: HttpErrorResponse, mensaje: string): void {
    this.cargando = false;
    this.guardando = false;
    void Swal.fire({ icon: 'error', title: 'Error', text: error?.error?.message || mensaje });
=======
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
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
  }
}
