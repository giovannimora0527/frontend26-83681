import { Usuario } from "./usuario";
export class Cliente {
    clienteId?: number;
    usuario?: number;
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