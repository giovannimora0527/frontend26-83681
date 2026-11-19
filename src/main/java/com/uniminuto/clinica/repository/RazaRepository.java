package com.uniminuto.clinica.repository;

import com.uniminuto.clinica.entity.Cliente;
import com.uniminuto.clinica.entity.Mascota;
import com.uniminuto.clinica.entity.Raza;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/** Permite consultar y guardar los datos relacionados con una raza. */
@Repository
public interface RazaRepository extends JpaRepository<Raza, Integer> {

    /** Busca el registro por su nombre. */
    Optional<Raza> findByNombre(String nombre);

    /** Busca una raza por especie y nombre. */
    Optional<Raza> findByEspecieAndNombre(String especie, String nombre);

}
