package com.uniminuto.clinica.service;

import com.uniminuto.clinica.entity.FormulaMedica;
import com.uniminuto.clinica.exception.BadRequestException;
import com.uniminuto.clinica.models.FormulaMedicaRq;
import com.uniminuto.clinica.models.MiRespuestaRS;

import java.util.List;

public interface FormulaMedicaService {

    /**
     * Lista las fórmulas médicas ordenadas por fecha de creación descendente.
     *
     * @return lista de fórmulas.
     * @throws BadRequestException excepción de validación.
     */
    List<FormulaMedica> listarFormulasMedicas() throws BadRequestException;

    /**
     * Consulta una fórmula médica por su identificador.
     *
     * @param id identificador de la fórmula.
     * @return fórmula encontrada.
     * @throws BadRequestException si no existe.
     */
    FormulaMedica buscarFormulaMedica(Long id) throws BadRequestException;

    /**
     * Registra una nueva fórmula médica validando las reglas de negocio.
     *
     * @param formulaMedicaRq datos de la fórmula.
     * @return respuesta de la operación.
     * @throws BadRequestException si los datos o las reglas de negocio no se cumplen.
     */
    MiRespuestaRS crearFormulaMedica(FormulaMedicaRq formulaMedicaRq) throws BadRequestException;

    /**
     * Actualiza una fórmula médica validando las reglas de negocio.
     *
     * @param formulaMedicaRq datos actualizados.
     * @return respuesta de la operación.
     * @throws BadRequestException si los datos o las reglas de negocio no se cumplen.
     */
    MiRespuestaRS actualizarFormulaMedica(FormulaMedicaRq formulaMedicaRq) throws BadRequestException;
}