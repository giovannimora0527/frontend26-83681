package com.uniminuto.clinica.apicontroller;

import com.uniminuto.clinica.api.ClinicaApi;
import com.uniminuto.clinica.models.MiRespuestaRS;
import com.uniminuto.clinica.service.ClinicaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import com.uniminuto.clinica.exception.BadRequestException;
import org.springframework.web.bind.annotation.RestController;

/** Atiende las peticiones relacionadas con las comprobaciones de la aplicación. */
@RestController
public class ClinicaApiController implements ClinicaApi {

    @Autowired
    private ClinicaService clinicaService;

    /** Devuelve una respuesta para comprobar el acceso al servicio. */
    @Override
    public ResponseEntity<String> testService() throws BadRequestException {
        return ResponseEntity.ok("Servicio funcionando correctamente");
    }

    /** Devuelve la respuesta de la segunda comprobación del servicio. */
    @Override
    public ResponseEntity<String> testService2() throws BadRequestException {
        return ResponseEntity.ok(clinicaService.testService2());
    }

    /** Devuelve la respuesta de la tercera comprobación del servicio. */
    @Override
    public ResponseEntity<MiRespuestaRS> testService3()
            throws BadRequestException {
        return ResponseEntity.ok(clinicaService.testService3());
    }
}
