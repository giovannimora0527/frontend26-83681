export class Usuario {
    id?: number;
    userName?: string;
    /** Solo se envía al crear o al cambiar la contraseña; el backend nunca la devuelve. */
    password?: string;
    rol?: string;
    email?: string;
    fechaCreacion?: Date | string;
    activo?: boolean;
}
