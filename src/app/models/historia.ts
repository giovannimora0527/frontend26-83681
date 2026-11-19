import { Mascota } from './mascota';

/** Define los datos que utiliza la aplicación para representar la historia clínica. */
export class Historia {
    id!: number;
    fechaCreacion!: Date | string;
    mascota!: Mascota;
}
