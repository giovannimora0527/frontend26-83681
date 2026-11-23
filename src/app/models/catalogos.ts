/**
 * Datos mínimos de cliente para los combos (vienen de /catalogo/clientes).
 */
export interface ClienteResumen {
  id: number;
  clienteId?: number;
  nombres?: string;
  apellidos?: string;
  numeroDocumento?: string;
}

/**
 * Datos mínimos de mascota para los combos (vienen de /catalogo/clientes/{id}/mascotas).
 */
export interface MascotaResumen {
  mascotaId: number;
  nombreMascota?: string;
}

/**
 * Mascota con su cliente (vienen de /catalogo/mascotas/{id}).
 */
export interface MascotaCompleta extends MascotaResumen {
  cliente?: { id: number; clienteId?: number } | null;
}

/**
 * Datos mínimos de veterinario para los combos (vienen de /catalogo/veterinarios).
 */
export interface VeterinarioResumen {
  id: number;
  nombres?: string;
  apellidos?: string;
  registroProfesional?: string;
}

/**
 * Devuelve el nombre completo de un cliente o veterinario para mostrarlo en un combo.
 *
 * @param persona objeto con nombres y apellidos.
 * @returns texto "Nombres Apellidos".
 */
export function nombreCompleto(persona: { nombres?: string; apellidos?: string }): string {
  return `${persona.nombres ?? ''} ${persona.apellidos ?? ''}`.trim();
}
