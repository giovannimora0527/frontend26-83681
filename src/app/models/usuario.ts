/** Representa una cuenta de usuario y su perfil. */
export class Usuario {
    id?: number;
    username?: string;
    password_hash?: string;
    rol?: string;
    email?: string;
    fechaCreacion?: Date;
    activo?: boolean;
}