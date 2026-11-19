package com.uniminuto.clinica.service;

import com.uniminuto.clinica.models.AnotacionHistoriaRq;
import com.uniminuto.clinica.models.MiRespuestaRS;

/** Define las operaciones disponibles para gestionar una anotación del historial clínico. */
public interface AnotacionHistoriaService {

    /** Registra una nueva anotación en la historia clínica. */
    MiRespuestaRS crearAnotacionHistoria(AnotacionHistoriaRq anotacionHistoriaRq);
}
