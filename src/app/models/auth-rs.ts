/** Contiene la respuesta del servidor al solicitar el inicio de sesión. */
export class AuthRs {
    username!: string;
    login!: boolean;
    usuarioId!: number;
}