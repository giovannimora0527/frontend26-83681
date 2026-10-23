export class Cliente {
    cliente_id?: number;
    usuario_id?: number;
    tipo_documento?: string;
    numero_documento?: number | string;
    nombres?: string;
    apellidos?: string;
    fecha_nacimiento?: Date;
    genero?: string;
    telefono?: string;
    direccion?: string;
    activo?: boolean;
}