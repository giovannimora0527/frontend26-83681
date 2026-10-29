package com.uniminuto.clinica.apicontroller;

import com.uniminuto.clinica.api.FormulaMedicaApi;
import com.uniminuto.clinica.entity.FormulaMedica;
import com.uniminuto.clinica.exception.BadRequestException;
import com.uniminuto.clinica.models.FormulaMedicaRq;
import com.uniminuto.clinica.models.MiRespuestaRS;
import com.uniminuto.clinica.service.FormulaMedicaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class FormulaMedicaApiController implements FormulaMedicaApi {

    @Autowired
    private FormulaMedicaService formulaMedicaService;

    @Override
    public ResponseEntity<List<FormulaMedica>> listarFormulasMedicas() throws BadRequestException {
        return ResponseEntity.ok(this.formulaMedicaService.listarFormulasMedicas());
    }

    @Override
    public ResponseEntity<FormulaMedica> buscarFormulaMedica(Long id) throws BadRequestException {
        return ResponseEntity.ok(this.formulaMedicaService.buscarFormulaMedica(id));
    }

    @Override
    public ResponseEntity<MiRespuestaRS> crearFormulaMedica(FormulaMedicaRq formulaMedicaRq) throws BadRequestException {
        return ResponseEntity.status(HttpStatus.CREATED).body(this.formulaMedicaService.crearFormulaMedica(formulaMedicaRq));
    }

    @Override
    public ResponseEntity<MiRespuestaRS> actualizarFormulaMedica(FormulaMedicaRq formulaMedicaRq) throws BadRequestException {
        return ResponseEntity.ok(this.formulaMedicaService.actualizarFormulaMedica(formulaMedicaRq));
    }
}