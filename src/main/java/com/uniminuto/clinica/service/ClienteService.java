package com.uniminuto.clinica.service;

import com.uniminuto.clinica.entity.Cliente;
import com.uniminuto.clinica.exception.BadRequestException;

import java.util.List;

/** Define las operaciones disponibles para gestionar un propietario de mascotas. */
public interface ClienteService {

    /** Consulta los propietarios registrados. */
    List<Cliente> listarClientes() throws BadRequestException;


    /** Obtiene un propietario a partir de su número de documento. */
    Cliente getClienteByNumeroDocumento(String numeroDocumento) throws BadRequestException;
}
