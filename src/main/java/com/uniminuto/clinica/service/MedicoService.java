package com.uniminuto.clinica.service;

import com.uniminuto.clinica.entity.Medico;
import com.uniminuto.clinica.exception.BadRequestException;

import java.util.List;

/** Define las operaciones disponibles para gestionar un veterinario. */
public interface MedicoService {

    /** Consulta los veterinarios registrados. */
    List<Medico> listarMedicos();

    /** Busca el veterinario que coincide con el criterio indicado. */
    Medico buscarMedico(String tipoDocumento, String numeroDocumento)
            throws BadRequestException;

    /** Busca un veterinario por su registro profesional. */
    Medico buscarMedicoPorRegistroProfesional(String registroProfesional)
            throws BadRequestException;
}
