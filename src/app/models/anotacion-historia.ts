import { Medico } from "./medico";

export class AnotacionHistoria {
  id!: number;
  historiaId?: number;
  mascotaId?: number;
  medicoId?: number;
  fecha?: string;
  descripcion?: string;
  observacion?: string;
  diagnosticoEvolucion?: string;
  medico?: Medico;
}