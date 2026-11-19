package com.uniminuto.clinica.models;

import lombok.Data;

/** Contiene los datos de una anotación clínica. */
@Data
public class AnotacionRq {

    private Long mascotaId;

    private Long medicoId;

    private String descripcion;
}
