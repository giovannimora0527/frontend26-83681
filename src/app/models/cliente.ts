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