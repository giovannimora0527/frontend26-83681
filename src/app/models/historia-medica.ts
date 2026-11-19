import { AnotacionHistoria } from './anotacion-historia';
import { Historia } from './historia';

/** Define los datos que utiliza la aplicación para representar la historia clínica. */
export class HistoriaMedica {
    historia!: Historia;
    anotaciones!: AnotacionHistoria[];
}
