import { Cliente } from "./cliente";
import { Raza } from "./raza";

export class Mascota {
    mascotaId?: number;
    nombreMascota?: string;
    edad?: number;
    fechaRegistro?: Date;
    cliente?: Cliente;
    raza?: Raza;
    razaId?: number | string;
    clienteId?: number | string;
    nombre?: string;
}