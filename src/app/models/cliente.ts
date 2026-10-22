/**
 * Cliente tal como lo devuelve el backend. El identificador llega como "id".
 */
export class Cliente {
    id?: number;
    clienteId?: number;
    usuarioId?: number;
    tipoDocumento?: string;
    numeroDocumento?: string;
    nombres?: string;
    apellidos?: string;
    fechaNacimiento?: string;
    genero?: string;
    telefono?: string;
    direccion?: string;
    activo!: boolean;
}

/** Datos que se envían al backend para crear o actualizar un cliente. */
export interface ClienteRq {
    tipoDocumento: string;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    fechaNacimiento: string;
    genero: string | null;
    telefono: string | null;
    direccion: string | null;
    activo: boolean;
}
