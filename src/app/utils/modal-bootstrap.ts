// Objeto global de Bootstrap (se carga en angular.json -> scripts)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare var bootstrap: any;

/**
 * Pequeña clase para abrir y cerrar un modal de Bootstrap por su id,
 * evitando repetir el mismo codigo en cada componente.
 */
export class ModalBootstrap {

  /**
   * @param idModal id del elemento HTML del modal (ej: "modalCita").
   */
  constructor(private idModal: string) {}

  /** Abre el modal. */
  abrir(): void {
    const elemento = document.getElementById(this.idModal);
    bootstrap.Modal.getOrCreateInstance(elemento).show();
  }

  /** Cierra el modal. */
  cerrar(): void {
    const elemento = document.getElementById(this.idModal);
    bootstrap.Modal.getOrCreateInstance(elemento).hide();
  }
}
