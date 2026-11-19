package com.uniminuto.clinica.models;

import lombok.Data;

/** Contiene los datos enviados para gestionar una anotación del historial clínico. */
@Data
public class AnotacionHistoriaRq {
    private Integer mascotaId;
    private Integer historiaId;
    private Long medicoId;
    private String descripcion;
}
