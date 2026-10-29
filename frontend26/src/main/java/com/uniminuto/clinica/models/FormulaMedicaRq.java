package com.uniminuto.clinica.models;

import lombok.Data;

/**
 * Objeto de solicitud (request) usado para crear o actualizar una fórmula médica.
 */
@Data
public class FormulaMedicaRq {

    /** Identificador de la fórmula (solo requerido al actualizar). */
    private Long id;

    /** Cita (consulta) a la que se asocia la fórmula. */
    private Long citaId;

    /** Medicamento formulado. */
    private Long medicamentoId;

    /** Dosis del medicamento. */
    private String dosis;

    /** Indicaciones adicionales (opcional). */
    private String indicaciones;
}