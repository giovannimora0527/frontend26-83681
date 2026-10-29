package com.uniminuto.clinica.repository;

import com.uniminuto.clinica.entity.AnotacionHistoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnotacionHistoriaRepository extends JpaRepository<AnotacionHistoria, Long> {

    /**
     * Lista todas las anotaciones que pertenecen a una historia médica
     * específica, ordenadas de la más reciente a la más antigua.
     *
     * @param historiaId identificador de la historia médica.
     * @return lista de anotaciones asociadas a esa historia médica.
     */
    List<AnotacionHistoria> findByHistoria_IdOrderByFechaDesc(Long historiaId);

    /**
     * Lista todas las anotaciones registradas, de la más reciente a la más antigua.
     *
     * @return lista de anotaciones ordenada por fecha descendente.
     */
    List<AnotacionHistoria> findAllByOrderByFechaDesc();
}