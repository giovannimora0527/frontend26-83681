package com.uniminuto.clinica.api;

import com.uniminuto.clinica.entity.AnotacionHistoria;
import com.uniminuto.clinica.exception.BadRequestException;
import com.uniminuto.clinica.models.AnotacionHistoriaRq;
import com.uniminuto.clinica.models.MiRespuestaRS;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequestMapping("/anotacion-historia")
public interface AnotacionHistoriaApi {

    /**
     * Registra una nueva anotación asociada a una historia médica.
     *
     * @param anotacionHistoriaRq datos de la anotación a crear.
     * @return respuesta HTTP 201 con el resultado de la operación.
     * @throws BadRequestException excepción de validación.
     */
    @PostMapping(value = "/guardar",
            produces = {"application/json"},
            consumes = {"application/json"})
    ResponseEntity<MiRespuestaRS> crearAnotacionHistoria(
            @RequestBody AnotacionHistoriaRq anotacionHistoriaRq)
            throws BadRequestException;

    /**
     * Lista todas las anotaciones de una historia médica específica,
     * ordenadas de la más reciente a la más antigua.
     *
     * @param historiaId identificador de la historia médica.
     * @return respuesta HTTP 200 con la lista de anotaciones.
     * @throws BadRequestException excepción de validación.
     */
    @GetMapping(value = "/listar",
            produces = {"application/json"})
    ResponseEntity<List<AnotacionHistoria>> listarAnotacionesHistoria(
            @RequestParam Long historiaId)
            throws BadRequestException;

    /**
     * Actualiza una anotación de historia médica ya existente.
     *
     * @param anotacionHistoriaRq datos actualizados de la anotación.
     * @return respuesta HTTP 200 con el resultado de la operación.
     * @throws BadRequestException excepción de validación.
     */
    /**
     * Lista todas las anotaciones registradas, de la más reciente a la más antigua.
     *
     * @return respuesta HTTP 200 con la lista de anotaciones.
     * @throws BadRequestException excepción de validación.
     */
    @GetMapping(value = "/listar-anotaciones",
            produces = {"application/json"})
    ResponseEntity<List<AnotacionHistoria>> listarTodasLasAnotaciones()
            throws BadRequestException;

    @PostMapping(value = "/actualizar",
            produces = {"application/json"},
            consumes = {"application/json"})
    ResponseEntity<MiRespuestaRS> actualizarAnotacionHistoria(
            @RequestBody AnotacionHistoriaRq anotacionHistoriaRq)
            throws BadRequestException;
}