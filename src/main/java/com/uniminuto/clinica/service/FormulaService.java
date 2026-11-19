package com.uniminuto.clinica.service;

import com.uniminuto.clinica.entity.FormulaMedica;

import java.util.List;

/** Define las operaciones disponibles para gestionar la prescripción médica. */
public interface FormulaService {

    /** Consulta las fórmulas médicas registradas. */
    List<FormulaMedica> findAllFormulas();
}
