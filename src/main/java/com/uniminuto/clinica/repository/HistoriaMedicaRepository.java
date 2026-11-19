package com.uniminuto.clinica.repository;

import com.uniminuto.clinica.entity.AnotacionHistoria;
import com.uniminuto.clinica.entity.HistoriaMedica;
import com.uniminuto.clinica.entity.Mascota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/** Permite consultar y guardar los datos relacionados con la historia clínica. */
@Repository
public interface HistoriaMedicaRepository extends JpaRepository<HistoriaMedica, Long> {

    /** Consulta los registros que pertenecen a la mascota indicada. */
    Optional<HistoriaMedica> findByMascota(Mascota mascota);
}
