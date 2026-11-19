package com.uniminuto.clinica.apicontroller;

import com.uniminuto.clinica.api.CitaApi;
import com.uniminuto.clinica.entity.Cita;
import com.uniminuto.clinica.models.CitaRq;
import com.uniminuto.clinica.models.MiRespuestaRS;
import com.uniminuto.clinica.service.CitaService;
import com.uniminuto.clinica.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

/** Atiende las peticiones relacionadas con una cita veterinaria. */
@RestController
public class CitaApiController implements CitaApi {

    @Autowired
    private CitaService citaService;


    /** Consulta las citas registradas. */
    @Override
    public ResponseEntity<List<Cita>> listarCitas() throws BadRequestException {
        return ResponseEntity.ok(this.citaService.listarCitas());
    }

    /** Consulta las citas entre la fecha inicial y la final. */
    @Override
    public ResponseEntity<List<Cita>> listarCitasRango(LocalDateTime fechaInicio, LocalDateTime fechaFin)
            throws BadRequestException {
        return ResponseEntity.ok(this.citaService.listarCitasRango(fechaInicio, fechaFin));
    }

    /** Registra los datos y el horario de una nueva cita. */
    @Override
    public ResponseEntity<MiRespuestaRS> crearCita(CitaRq cita) throws BadRequestException {
        return ResponseEntity.ok(this.citaService.crearCita(cita));
    }

    /** Guarda los cambios de la cita indicada. */
    @Override
    public ResponseEntity<MiRespuestaRS> actualizarCita(CitaRq cita) throws BadRequestException {
        return ResponseEntity.ok(this.citaService.actualizarCita(cita));
    }
}
