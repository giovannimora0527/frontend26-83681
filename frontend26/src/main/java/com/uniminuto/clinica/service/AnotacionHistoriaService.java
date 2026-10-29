package com.uniminuto.clinica.service;

import com.uniminuto.clinica.entity.AnotacionHistoria;
import com.uniminuto.clinica.exception.BadRequestException;
import com.uniminuto.clinica.models.AnotacionHistoriaRq;
import com.uniminuto.clinica.models.MiRespuestaRS;
import java.util.List;

public interface AnotacionHistoriaService {

    /**
     * Registra una nueva anotación asociada a una historia médica.
     *
     * @param anotacionHistoriaRq datos de la anotación a crear.
     * @return respuesta con el resultado de la operación.
     * @throws BadRequestException si los datos de entrada no son válidos.
     */
    MiRespuestaRS crearAnotacionHistoria(AnotacionHistoriaRq anotacionHistoriaRq) throws BadRequestException;

    /**
     * Lista todas las anotaciones de una historia médica específica,
     * ordenadas de la más reciente a la más antigua.
     *
     * @param historiaId identificador de la historia médica.
     * @return lista de anotaciones asociadas a esa historia médica.
     * @throws BadRequestException si la historia médica no existe.
     */
    List<AnotacionHistoria> listarAnotacionesHistoria(Long historiaId) throws BadRequestException;

    /**
     * Lista todas las anotaciones registradas, de la más reciente a la más antigua.
     *
     * @return lista de anotaciones.
     * @throws BadRequestException excepción de validación.
     */
    List<AnotacionHistoria> listarTodasLasAnotaciones() throws BadRequestException;

    /**
     * Actualiza una anotación de historia médica ya existente.
     *
     * @param anotacionHistoriaRq datos actualizados de la anotación.
     * @return respuesta con el resultado de la operación.
     * @throws BadRequestException si los datos no son válidos o la anotación no existe.
     */
    MiRespuestaRS actualizarAnotacionHistoria(AnotacionHistoriaRq anotacionHistoriaRq) throws BadRequestException;
}