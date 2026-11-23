import { Cliente } from "./cliente";
import { Raza } from "./raza";

export class Mascota {
    mascotaId?: number;
    nombreMascota?: string;
    edad?: number;
<<<<<<< HEAD
    fechaRegistro?: Date | string;
    fechaModificacion?: Date | string;
    cliente?: Cliente;
    raza?: Raza;
    razaId?: number;
    clienteId?: number;
    nombre?: string;
    activo?: boolean;
=======
    fechaRegistro?: Date;
    fechaModificacion?: Date;
    raza?: Raza;
    cliente?: Cliente;
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
}