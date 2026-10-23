// Datos que se envian al backend para crear o actualizar una cita
export class CitaRq {
    id?: number;
    clienteId?: number;
    mascotaId?: number;
    medicoId?: number;
    fechaHora?: string;
    motivo?: string;
    estado?: string;
}
