package com.uniminuto.clinica.service;

import com.uniminuto.clinica.entity.FormulaMedica;

import java.util.List;

/** Define las operaciones disponibles para gestionar una fórmula médica. */
public interface FormulaMedicaService {

    /** Consulta las fórmulas en el orden usado para el listado. */
    List<FormulaMedica> listarFormulasOrdenadas(boolean asc);
}
