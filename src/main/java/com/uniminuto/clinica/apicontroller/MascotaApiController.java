package com.uniminuto.clinica.apicontroller;

import com.uniminuto.clinica.api.MascotaApi;
import com.uniminuto.clinica.entity.Mascota;
import com.uniminuto.clinica.exception.BadRequestException;
import com.uniminuto.clinica.models.MascotaRq;
import com.uniminuto.clinica.models.MiRespuestaRS;
import com.uniminuto.clinica.service.MascotaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

/** Atiende las peticiones relacionadas con una mascota. */
@RestController
public class MascotaApiController implements MascotaApi {

    @Autowired
    private MascotaService mascotaService;

    /** Consulta las mascotas registradas. */
    @Override
    public ResponseEntity<List<Mascota>> listarMascotas() throws BadRequestException {
       return ResponseEntity.ok(mascotaService.listarMascotas());
    }

    /** Consulta las mascotas en el orden indicado. */
    @Override
    public ResponseEntity<List<Mascota>> listarMascotasOrdenado(boolean ascendente) throws BadRequestException {
        return ResponseEntity.ok(mascotaService.listarMascotasOrdenado(ascendente));
    }

    /** Busca mascotas por el nombre recibido. */
    @Override
    public ResponseEntity<List<Mascota>> buscarMascotaPorNombre(String nombre) throws BadRequestException {
        return ResponseEntity.ok(mascotaService.findByNombreMascota(nombre).map(List::of).orElseGet(List::of));
    }

    /** Consulta las mascotas del propietario indicado. */
    @Override
    public ResponseEntity<List<Mascota>> buscarMascotaPorCliente(Long clienteId) throws BadRequestException {
        return ResponseEntity.ok(mascotaService.buscarMascotasPorCliente(clienteId));

    }

    /** Busca mascotas por la raza indicada. */
    @Override
    public ResponseEntity<List<Mascota>> buscarMascotaPorRaza(Integer razaId) throws BadRequestException {
        return ResponseEntity.ok(mascotaService.buscarMascotasPorRaza(razaId));
    }

    /** Registra los datos de una nueva mascota. */
    @Override
    public ResponseEntity<MiRespuestaRS> guardarMascota(MascotaRq mascotaRq) throws BadRequestException {
        return ResponseEntity.ok(mascotaService.guardarMascota(mascotaRq));
    }

    /** Guarda los cambios de la mascota indicada. */
    @Override
    public ResponseEntity<MiRespuestaRS> actualizarMascota(MascotaRq mascotaRq) throws BadRequestException {
        return ResponseEntity.ok(mascotaService.actualizarMascota(mascotaRq));
    }
}
