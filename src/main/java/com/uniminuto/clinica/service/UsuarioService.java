package com.uniminuto.clinica.service;

import com.uniminuto.clinica.models.MiRespuestaRS;
import com.uniminuto.clinica.models.UsuarioRq;
import com.uniminuto.clinica.models.UsuarioRs;

import java.util.List;

/** Define las operaciones disponibles para gestionar una cuenta de usuario. */
public interface UsuarioService {

    /** Consulta las cuentas en el orden definido para el listado. */
    List<UsuarioRs> obtenerUsuariosOrdenados();

    /** Registra una nueva cuenta de usuario. */
    MiRespuestaRS crearUsuario(UsuarioRq usuarioRq);

    /** Guarda los cambios de la cuenta de usuario. */
    MiRespuestaRS actualizarUsuario(UsuarioRq usuarioRq);
}
