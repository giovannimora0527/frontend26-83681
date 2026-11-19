package com.uniminuto.clinica.apicontroller;

import com.uniminuto.clinica.api.FormulaMedicaApi;
import com.uniminuto.clinica.entity.FormulaMedica;
import com.uniminuto.clinica.service.FormulaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Atiende las peticiones relacionadas con una fórmula médica. */
@RestController
public class FormulaMedicaApiController implements FormulaMedicaApi {

    @Autowired
    private FormulaService formulaService;

    /** Consulta las fórmulas médicas registradas. */
    @Override
    public ResponseEntity<List<FormulaMedica>> listarFormulas() {
        return ResponseEntity.ok(this.formulaService.findAllFormulas());
    }
}
