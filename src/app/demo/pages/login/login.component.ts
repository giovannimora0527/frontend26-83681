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

type Paso = 'credenciales' | 'otp' | 'recuperar' | 'restablecer';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  anio: string = "2026";
  paso: Paso = 'credenciales';
  cargando = false;
  mostrarPassword = false;
  loginExitoso?: LoginRs;

  loginForm: FormGroup;
  otpForm: FormGroup;
  recuperarForm: FormGroup;
  restablecerForm: FormGroup;
  authRs?: AuthRs;

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
    this.restablecerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      token: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{6}$/)]],
      nuevaPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(72)]],
      confirmarPassword: ['', [Validators.required]]
    });
  }

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
          text: 'Se generó un código de 6 caracteres. Consulta el canal de verificación configurado para este entorno.',
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
    this.cargando = true;
    let tokenRq: TokenRq;
    tokenRq = {
      usuarioId: this.authRs?.usuarioId!,
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

  reenviarCodigo(): void {
    this.login();
  }

  recuperarPassword(): void {
    if (this.recuperarForm.invalid) {
      this.recuperarForm.markAllAsTouched();
      return;
    }
    this.cargando = true;
    const email = (this.recuperarForm.value.email as string).trim();
    this.authService.recuperarPassword(email).subscribe({
      next: (rta) => {
        this.cargando = false;
        this.restablecerForm.reset({ email, token: '', nuevaPassword: '', confirmarPassword: '' });
        this.paso = 'restablecer';
        Swal.fire({
          icon: 'info',
          title: 'Revisa tu correo',
          text: rta?.message || 'Si el correo está registrado, recibirás un código para restablecer tu contraseña.'
        });
      },
      error: (err: HttpErrorResponse) => this.manejarError(err, 'No fue posible enviar el correo de recuperación')
    });
  }

  restablecerPassword(): void {
    if (this.restablecerForm.invalid || this.passwordsNoCoinciden) {
      this.restablecerForm.markAllAsTouched();
      return;
    }
    this.cargando = true;
    const { email, token, nuevaPassword } = this.restablecerForm.value;
    this.authService.restablecerPassword({ email, token, nuevaPassword }).subscribe({
      next: (rta) => {
        this.cargando = false;
        Swal.fire({
          icon: 'success',
          title: 'Contraseña actualizada',
          text: rta?.message || 'Ya puedes iniciar sesión con tu nueva contraseña.'
        });
        this.irA('credenciales');
      },
      error: (err: HttpErrorResponse) => this.manejarError(err, 'No fue posible restablecer la contraseña')
    });
  }

  get passwordsNoCoinciden(): boolean {
    const v = this.restablecerForm.value;
    return !!v.confirmarPassword && v.nuevaPassword !== v.confirmarPassword;
  }

  soloAlfanumericosRestablecer(event: Event): void {
    const input = event.target as HTMLInputElement;
    const limpio = input.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 6);
    if (limpio !== input.value) {
      this.restablecerForm.get('token')?.setValue(limpio);
    }
  }

  soloAlfanumericos(event: Event): void {
    const input = event.target as HTMLInputElement;
    const limpio = input.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 6);
    if (limpio !== input.value) {
      this.otpForm.get('token')?.setValue(limpio);
    }
  }

  irA(paso: Paso): void {
    this.paso = paso;
    if (paso === 'credenciales') {
      this.otpForm.reset();
      this.recuperarForm.reset();
      this.restablecerForm.reset();
    }
  }

  campoInvalido(form: FormGroup, campo: string): boolean {
    const control = form.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  private manejarError(err: HttpErrorResponse, mensaje: string): void {
    this.cargando = false;
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err?.error?.message || mensaje
    });
  }
}
