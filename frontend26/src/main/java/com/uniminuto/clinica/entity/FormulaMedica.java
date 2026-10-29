package com.uniminuto.clinica.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Entidad que representa una fórmula médica emitida durante una cita,
 * en la cual se prescribe un medicamento con su dosis e indicaciones.
 * Se mapea contra la tabla {@code formula_medica}.
 */
@Entity
@Data
@Table(name = "formula_medica")
public class FormulaMedica {

    /**
     * Identificador único de la fórmula médica.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * Cita en la que se generó la fórmula médica.
     */
    @ManyToOne
    @JoinColumn(name = "cita_id")
    private Cita cita;

    /**
     * Medicamento prescrito en la fórmula médica.
     */
    @ManyToOne
    @JoinColumn(name = "medicamento_id")
    private Medicamento medicamento;

    /**
     * Dosis indicada para el medicamento prescrito (incluye la frecuencia si el
     * veterinario la escribe, ej. "800 mg cada 12 horas").
     */
    @Column(name = "dosis", columnDefinition = "TEXT")
    private String dosis;

    /**
     * Indicaciones adicionales para el paciente.
     */
    @Column(name = "indicaciones", columnDefinition = "TEXT")
    private String indicaciones;

    /**
     * Fecha de creación del registro. Es el campo usado para ordenar el
     * listado de fórmulas médicas de la más reciente a la más antigua.
     */
    @Column(name = "fecha_creacion_registro")
    private LocalDateTime fechaCreacionRegistro;

    /**
     * Fecha de la última actualización del registro.
     */
    @Column(name = "fecha_actualizacion_registro")
    private LocalDateTime fechaActualizacionRegistro;
}