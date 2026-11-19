package com.uniminuto.clinica.models;

import lombok.Data;

/** Contiene los datos enviados para registrar o editar una raza. */
@Data
public class RazaRq {

    private Integer razaId;

    private String nombre;

    private String especie;
}
