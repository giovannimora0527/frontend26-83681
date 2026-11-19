package com.uniminuto.clinica.repository;

import com.uniminuto.clinica.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/** Permite consultar y guardar los datos relacionados con un propietario de mascotas. */
@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    /** Busca el registro por su número de documento. */
    Optional<Cliente> findByNumeroDocumento(String numeroDocumento);
}
