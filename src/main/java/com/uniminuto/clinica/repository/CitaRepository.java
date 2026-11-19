package com.uniminuto.clinica.repository;

import com.uniminuto.clinica.entity.Cita;
import com.uniminuto.clinica.entity.Mascota;
import com.uniminuto.clinica.entity.Medico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/** Permite consultar y guardar los datos relacionados con una cita veterinaria. */
@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {

    /** Consulta las citas agendadas dentro del intervalo indicado. */
    List<Cita> findByFechaHoraBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);

    /** Busca la historia clínica asociada a la mascota y al veterinario. */
    Optional<Cita> findByMascotaAndMedico(Mascota mascota, Medico medico);

    /** Consulta las citas del veterinario en el intervalo indicado. */
    List<Cita> findByMedicoAndFechaHoraBetween(Medico medico, LocalDateTime fechaInicio, LocalDateTime fechaFin);

}
