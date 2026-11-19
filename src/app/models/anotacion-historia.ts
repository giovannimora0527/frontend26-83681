import { Medico } from './medico';
import { Historia } from './historia';
import { Cita } from './cita';
import { Formula } from './formula';

/** Define los datos que utiliza la aplicación para representar la anotación clínica. */
export class AnotacionHistoria {
    id!: number;
    descripcion!: string;
    diagnostico?: string | null;
    observaciones?: string | null;
    fecha!: Date | string;
    historia!: Historia;
    medico!: Medico;
    cita?: Cita | null;
    formulasMedicas?: Formula[] | null;
}
