package com.uniminuto.clinica.api;

import com.uniminuto.clinica.models.MiRespuestaRS;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import com.uniminuto.clinica.exception.BadRequestException;

/** Agrupa las operaciones de comprobación de la aplicación. */
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequestMapping("/clinica")
public interface ClinicaApi {

    /**
     * Metodo test del servicio.
     *
     * @return Servicio funcionando correctamente.
     * @throws BadRequestException excepcion.
     */
    @GetMapping(value = "/test",
            produces = {"application/text"},
            consumes = {"application/json"})
    ResponseEntity<String> testService()
            throws BadRequestException;


    /** Devuelve la respuesta de la segunda comprobación del servicio. */
    @GetMapping(value = "/test2",
            produces = {"application/text"},
            consumes = {"application/json"})
    ResponseEntity<String> testService2()
            throws BadRequestException;

    /** Devuelve la respuesta de la tercera comprobación del servicio. */
    @GetMapping(value = "/test3",
            produces = {"application/json"},
            consumes = {"application/json"})
    ResponseEntity<MiRespuestaRS> testService3()
            throws BadRequestException;
}
