package com.uniminuto.clinica.apicontroller;

import com.uniminuto.clinica.api.AnotacionHistoriaApi;
import com.uniminuto.clinica.entity.AnotacionHistoria;
import com.uniminuto.clinica.exception.BadRequestException;
import com.uniminuto.clinica.models.AnotacionHistoriaRq;
import com.uniminuto.clinica.models.MiRespuestaRS;
import com.uniminuto.clinica.service.AnotacionHistoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class AnotacionHistoriaApiController implements AnotacionHistoriaApi {

    @Autowired
    private AnotacionHistoriaService anotacionHistoriaService;

    @Override
    public ResponseEntity<MiRespuestaRS> crearAnotacionHistoria(AnotacionHistoriaRq anotacionHistoriaRq) throws BadRequestException {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(this.anotacionHistoriaService.crearAnotacionHistoria(anotacionHistoriaRq));
    }

    @Override
    public ResponseEntity<List<AnotacionHistoria>> listarAnotacionesHistoria(Long historiaId) throws BadRequestException {
        return ResponseEntity.ok(this.anotacionHistoriaService.listarAnotacionesHistoria(historiaId));
    }

    @Override
    public ResponseEntity<List<AnotacionHistoria>> listarTodasLasAnotaciones() throws BadRequestException {
        return ResponseEntity.ok(this.anotacionHistoriaService.listarTodasLasAnotaciones());
    }

    @Override
    public ResponseEntity<MiRespuestaRS> actualizarAnotacionHistoria(AnotacionHistoriaRq anotacionHistoriaRq) throws BadRequestException {
        return ResponseEntity.ok(this.anotacionHistoriaService.actualizarAnotacionHistoria(anotacionHistoriaRq));
    }
}