// Datos que se envian al backend para guardar o actualizar una mascota
export class MascotaRq {
    mascotaId?: number;
    nombreMascota?: string;
    edad?: number;
    razaId?: number;
    clienteId?: number;
}
