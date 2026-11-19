import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

import { AuthService } from './service/auth.service';
import { AuthRs } from 'src/app/models/auth-rs';
import { TokenRq } from 'src/app/models/token-rq';
import { LoginRs } from 'src/app/models/login-rs';
import { environment } from 'src/environments/environment';

/** Enumera las pantallas del proceso de inicio de sesión. */
type Paso = 'credenciales' | 'otp' | 'recuperar';

/** Presenta la pantalla de inicio de sesión y gestiona sus acciones. */
@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  /** Enlace a la documentación de la API en el entorno de desarrollo. */
  readonly swaggerUrl = environment.swaggerUrl;
  anio: string = "2026";
  paso: Paso = 'credenciales';
  cargando = false;
  mostrarPassword = false;
  loginExitoso?: LoginRs;

  loginForm: FormGroup;
  otpForm: FormGroup;
  recuperarForm: FormGroup;
  authRs?: AuthRs;

  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
    this.otpForm = this.fb.group({
      token: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{6}$/)]]
    });
    this.recuperarForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  /** Envía las credenciales para solicitar el código de acceso. */
  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.cargando = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (data) => {
        this.cargando = false;
        this.authRs = data;
        this.otpForm.reset();
        this.paso = this.authRs.login? 'otp' : 'credenciales';
        if (this.paso === 'credenciales') {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo iniciar sesión con las credenciales proporcionadas.'
          });
          return;
        }
        Swal.fire({
          icon: 'info',
          title: 'Verificación en dos pasos',
          text: 'Se ha enviado un código de 6 caracteres a tu correo electrónico.',
          timer: 2500,
          showConfirmButton: false
        });
      },
      error: (err: HttpErrorResponse) => this.manejarError(err, 'Usuario o contraseña incorrectos')
    });
  }

  /**
   * Servicio que valida el token otp ingresado.
   * @returns 
   */
  validarToken(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }
    const usuarioId = this.authRs?.usuarioId;
    if (usuarioId == null) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se encontró la sesión de autenticación. Inicia sesión nuevamente.'
      });
      return;
    }
    this.cargando = true;
    const tokenRq: TokenRq = {
      usuarioId,
      username: this.loginForm.value.username,
      token: this.otpForm.value.token
    };
    this.authService
      .validateOtp(tokenRq)
      .subscribe({
        next: (data) => {
          this.loginExitoso = data;
          this.cargando = false;
          this.router.navigate(['/inicio']);
        },
        error: (err: HttpErrorResponse) => this.manejarError(err, 'El código ingresado no es válido o ha expirado')
      });
  }

  /** Repite la solicitud de inicio de sesión para pedir un nuevo código. */
  reenviarCodigo(): void {
    this.login();
  }

  /** Solicita el envío de un correo para recuperar el acceso. */
  recuperarPassword(): void {
    if (this.recuperarForm.invalid) {
      this.recuperarForm.markAllAsTouched();
      return;
    }
    this.cargando = true;
    this.authService.recuperarPassword(this.recuperarForm.value.email).subscribe({
      next: () => {
        this.cargando = false;
        Swal.fire({
          icon: 'success',
          title: 'Correo enviado',
          text: 'Revisa tu bandeja de entrada para restablecer tu contraseña.'
        });
        this.irA('credenciales');
      },
      error: (err: HttpErrorResponse) => this.manejarError(err, 'No fue posible enviar el correo de recuperación')
    });
  }

  /** Limita el código de verificación a seis letras o números. */
  soloAlfanumericos(event: Event): void {
    const input = event.target as HTMLInputElement;
    const limpio = input.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 6);
    if (limpio !== input.value) {
      this.otpForm.get('token')?.setValue(limpio);
    }
  }

  /** Cambia el paso visible del formulario de inicio de sesión. */
  irA(paso: Paso): void {
    this.paso = paso;
    if (paso === 'credenciales') {
      this.otpForm.reset();
      this.recuperarForm.reset();
    }
  }

  /** Indica si el control ya fue usado y tiene errores que deben mostrarse. */
  campoInvalido(form: FormGroup, campo: string): boolean {
    const control = form.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  /** Finaliza la carga y muestra el mensaje de error de la petición. */
  private manejarError(err: HttpErrorResponse, mensaje: string): void {
    this.cargando = false;
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err?.error?.message || mensaje
    });
  }
}
