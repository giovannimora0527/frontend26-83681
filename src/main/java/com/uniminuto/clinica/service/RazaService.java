package com.uniminuto.clinica.service;

import com.uniminuto.clinica.entity.Raza;
import com.uniminuto.clinica.exception.BadRequestException;
import com.uniminuto.clinica.models.MascotaRq;
import com.uniminuto.clinica.models.MiRespuestaRS;
import com.uniminuto.clinica.models.RazaRq;

import java.util.List;

/** Define las operaciones disponibles para gestionar una raza. */
public interface RazaService {

    /** Registra una nueva raza en el catálogo. */
    MiRespuestaRS crearRazaNueva(RazaRq razaRq) throws BadRequestException;

    /** Consulta el catálogo de razas. */
    List<Raza> listarRazas() throws BadRequestException;
}
