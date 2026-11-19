package com.uniminuto.clinica.apicontroller;

import com.uniminuto.clinica.api.AnotacionHistoriaApi;
import com.uniminuto.clinica.exception.BadRequestException;
import com.uniminuto.clinica.models.AnotacionHistoriaRq;
import com.uniminuto.clinica.models.MiRespuestaRS;
import com.uniminuto.clinica.service.AnotacionHistoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

/** Atiende las peticiones relacionadas con una anotación del historial clínico. */
@RestController
public class AnotacionHistoriaApiController implements AnotacionHistoriaApi {

    @Autowired
    private AnotacionHistoriaService anotacionHistoriaService;


    /** Registra una nueva anotación en la historia clínica. */
    @Override
    public ResponseEntity<MiRespuestaRS> crearAnotacionHistoria(AnotacionHistoriaRq anotacionHistoria) throws BadRequestException {
        return ResponseEntity.ok(anotacionHistoriaService.crearAnotacionHistoria(anotacionHistoria));
    }
}
