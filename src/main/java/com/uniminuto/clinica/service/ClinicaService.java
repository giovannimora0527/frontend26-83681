package com.uniminuto.clinica.service;

import com.uniminuto.clinica.models.MiRespuestaRS;
import com.uniminuto.clinica.exception.BadRequestException;

/** Define las operaciones disponibles para gestionar las comprobaciones de la aplicación. */
public interface ClinicaService {

    /** Devuelve la respuesta de la segunda comprobación del servicio. */
    String testService2() throws BadRequestException;


    /** Devuelve la respuesta de la tercera comprobación del servicio. */
    MiRespuestaRS testService3() throws BadRequestException;
}
