package com.uniminuto.clinica.repository;

import com.uniminuto.clinica.entity.Cliente;
import com.uniminuto.clinica.entity.Mascota;
import com.uniminuto.clinica.entity.Raza;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/** Permite consultar y guardar los datos relacionados con una mascota. */
@Repository
public interface MascotaRepository extends JpaRepository<Mascota, Integer> {

    /** Consulta las mascotas por nombre de la A a la Z. */
    List<Mascota> findAllByOrderByNombreMascotaAsc();

    /** Consulta las mascotas por nombre de la Z a la A. */
    List<Mascota> findAllByOrderByNombreMascotaDesc();

    /** Busca las mascotas por el nombre indicado. */
    Mascota findByNombreMascota(String nombreMascota);

    /** Consulta las mascotas del propietario ordenadas por nombre. */
    List<Mascota> findByClienteOrderByNombreMascotaAsc(Cliente c);

    /** Consulta las mascotas de la raza y las ordena por nombre. */
    List<Mascota> findByRazaOrderByNombreMascotaAsc(Raza raza);
}
