package com.uniminuto.clinica.repository;

import com.uniminuto.clinica.entity.Medico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/** Permite consultar y guardar los datos relacionados con un veterinario. */
@Repository
public interface MedicoRepository extends JpaRepository<Medico, Long> {

    /** Busca el registro por el tipo y el número de documento. */
    Optional<Medico> findByTipoDocumentoAndNumeroDocumento(String tipoDocumento, String numeroDocumento);

    /** Busca el veterinario por su registro profesional. */
    Optional<Medico> findByRegistroProfesional(String registroProfesional);
}
