import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Usuario } from 'src/app/models/usuario';
import { PerfilUsuario, UsuarioRequest, UsuarioService } from './service/usuario.service';

@Component({
  selector: 'app-usuario',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.scss'
})
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
      }
    });
  }

  private mostrarError(error: HttpErrorResponse, mensaje: string): void {
    this.cargando = false;
    this.guardando = false;
    void Swal.fire({ icon: 'error', title: 'Error', text: error?.error?.message || mensaje });
  }
}
