package com.uniminuto.clinica.serviceimpl;

import com.uniminuto.clinica.models.MiRespuestaRS;
import com.uniminuto.clinica.service.ClinicaService;
import com.uniminuto.clinica.exception.BadRequestException;
import org.springframework.stereotype.Service;

/** Implementa las operaciones relacionadas con las comprobaciones de la aplicación. */
@Service
public class ClinicaServiceImpl implements ClinicaService {

    /** Devuelve la respuesta de la segunda comprobación del servicio. */
    @Override
    public String testService2() throws BadRequestException {
        return "Servicio ok";
    }

    /** Devuelve la respuesta de la tercera comprobación del servicio. */
    @Override
    public MiRespuestaRS testService3() throws BadRequestException {
        MiRespuestaRS respuesta = new MiRespuestaRS();
        respuesta.setStatus(200);
        respuesta.setMessage("Servicio ok desde clase y objeto");
        return respuesta;
    }
}
