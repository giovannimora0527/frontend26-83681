package com.uniminuto.clinica.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "historia_medica")
public class HistoriaMedica {

    /**
     * Identificador único de la historia médica.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * Paciente (mascota) al que pertenece esta historia médica.
     */
    @ManyToOne
    @JoinColumn(name = "paciente_id")
    private Mascota paciente;

    /**
     * Fecha de creación de la historia médica.
     */
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    /**
     * Alias de {@code paciente} para la respuesta JSON: la pantalla espera la propiedad
     * {@code mascota}. No agrega columnas ni modifica la base de datos.
     *
     * @return la mascota (paciente) de la historia médica.
     */
    @JsonProperty("mascota")
    public Mascota getMascota() {
        return this.paciente;
    }
}