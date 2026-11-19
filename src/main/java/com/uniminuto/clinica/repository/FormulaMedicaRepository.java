package com.uniminuto.clinica.repository;

import com.uniminuto.clinica.entity.FormulaMedica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/** Permite consultar y guardar los datos relacionados con una fórmula médica. */
@Repository
public interface FormulaMedicaRepository extends JpaRepository<FormulaMedica, Long> {

    /** Consulta los registros del más reciente al más antiguo. */
    List<FormulaMedica> findAllByOrderByFechaCreacionRegistroDesc();

    /** Consulta los registros del más antiguo al más reciente. */
    List<FormulaMedica> findAllByOrderByFechaCreacionRegistroAsc();
}
