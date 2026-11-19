import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthRs } from 'src/app/models/auth-rs';
import { LoginRs } from 'src/app/models/login-rs';
import { TokenRq } from 'src/app/models/token-rq';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/** Contiene el usuario y la contraseña ingresados. */
export interface LoginRequest {
  username: string;
  password: string;
}

/** Contiene los datos para validar el código de verificación. */
export interface ValidateTokenRequest {
  username: string;
  token: string;
}

/** Contiene el token que devuelve el servidor después de validar el acceso. */
export interface JwtResponse {
  token?: string;
  jwt?: string;
  accessToken?: string;
}

/** Gestiona el inicio de sesión y el token utilizado en las peticiones. */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = 'auth';
  static readonly TOKEN_KEY = 'token';

  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor(private backendService: BackendService) { }

  /** Envía las credenciales para solicitar el código de acceso. */
  login(data: LoginRequest): Observable<AuthRs> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'login', data);
  }

  /** Envía el código de acceso para solicitar la sesión autenticada. */
  validateOtp(data: TokenRq): Observable<LoginRs> {
    return this.backendService
      .post<LoginRs>(environment.apiUrlAuth, this.api, 'validate-token', data)
      .pipe(tap((resp) => this.guardarToken({ token: resp?.token })));
  }

  /** Envía el código de acceso al servidor y obtiene la respuesta de autenticación. */
  validateToken(data: ValidateTokenRequest): Observable<JwtResponse> {
    return this.backendService
      .post<JwtResponse>(environment.apiUrlAuth, this.api, 'validate-token', data)
      .pipe(tap((resp) => this.guardarToken(resp)));
  }

  /** Solicita el envío de un correo para recuperar el acceso. */
  recuperarPassword(email: string): Observable<unknown> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'recover-password', { email });
  }

  /** Guarda el token de sesión. */
  guardarToken(resp: JwtResponse): void {
    const jwt = resp?.token || resp?.jwt || resp?.accessToken;
    if (!jwt) {
      throw new Error('La respuesta no contiene un token JWT');
    }
    sessionStorage.setItem(AuthService.TOKEN_KEY, jwt);
  }

  /** Lee el token guardado en la sesión del navegador. */
  getToken(): string | null {
    return sessionStorage.getItem(AuthService.TOKEN_KEY);
  }

  /** Comprueba si hay un token guardado en la sesión del navegador. */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /** Retira el token guardado en la sesión del navegador. */
  logout(): void {
    sessionStorage.removeItem(AuthService.TOKEN_KEY);
  }
}
