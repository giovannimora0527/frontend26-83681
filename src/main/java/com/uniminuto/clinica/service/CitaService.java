package com.uniminuto.clinica.service;

import com.uniminuto.clinica.entity.Cita;
import com.uniminuto.clinica.exception.BadRequestException;
import com.uniminuto.clinica.models.CitaRq;
import com.uniminuto.clinica.models.MiRespuestaRS;

import java.time.LocalDateTime;
import java.util.List;

/** Define las operaciones disponibles para gestionar una cita veterinaria. */
public interface CitaService {

    /** Consulta las citas registradas. */
    List<Cita> listarCitas() throws BadRequestException;

    /** Consulta las citas entre la fecha inicial y la final. */
    List<Cita> listarCitasRango(LocalDateTime fechaInicio, LocalDateTime fechaFin) throws BadRequestException;

    /** Registra los datos y el horario de una nueva cita. */
    MiRespuestaRS crearCita(CitaRq citaRq) throws BadRequestException;

    /** Guarda los cambios de la cita indicada. */
    MiRespuestaRS actualizarCita(CitaRq citaRq) throws BadRequestException;
}
