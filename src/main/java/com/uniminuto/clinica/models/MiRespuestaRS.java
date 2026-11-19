package com.uniminuto.clinica.models;

import lombok.Data;

/** Contiene el mensaje devuelto por una operación del sistema. */
@Data
public class MiRespuestaRS {

    private int status;
    private String message;
}
