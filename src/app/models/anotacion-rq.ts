// Datos que se envian al backend para agregar una anotacion a una historia clinica.
// La fecha no se envia: la asigna el servidor.
export class AnotacionRq {
    historiaId?: number;
    medicoId?: number;
    descripcion?: string;
    observacion?: string;
    diagnostico?: string;
}
