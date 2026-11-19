package com.uniminuto.clinica.repository;

import com.uniminuto.clinica.entity.AnotacionHistoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/** Permite consultar y guardar los datos relacionados con una anotación del historial clínico. */
@Repository
public interface AnotacionHistoriaRepository extends JpaRepository<AnotacionHistoria, Long> {

}
