package com.uniminuto.clinica.service;

import com.uniminuto.clinica.entity.Mascota;
import com.uniminuto.clinica.exception.BadRequestException;
import com.uniminuto.clinica.models.MascotaRq;
import com.uniminuto.clinica.models.MiRespuestaRS;

import java.util.Optional;
import java.util.List;

/** Define las operaciones disponibles para gestionar una mascota. */
public interface MascotaService {

    /** Consulta las mascotas registradas. */
    List<Mascota> listarMascotas();

    /** Consulta las mascotas en el orden indicado. */
    List<Mascota> listarMascotasOrdenado(boolean ascendente);

    /** Busca las mascotas por el nombre indicado. */
    Optional<Mascota> findByNombreMascota(String nombreMascota);

    /** Consulta las mascotas asociadas al propietario. */
    List<Mascota> buscarMascotasPorCliente(Long clienteId) throws BadRequestException;

    /** Consulta las mascotas asociadas a la raza. */
    List<Mascota> buscarMascotasPorRaza(Integer razaId) throws BadRequestException;

    /** Registra los datos de una nueva mascota. */
    MiRespuestaRS guardarMascota(MascotaRq mascotaRq) throws BadRequestException;

    /** Guarda los cambios de la mascota indicada. */
    MiRespuestaRS actualizarMascota(MascotaRq mascotaRq) throws BadRequestException;

}

