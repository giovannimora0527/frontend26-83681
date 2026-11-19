package com.uniminuto.clinica.apicontroller;

import com.uniminuto.clinica.api.ClienteApi;
import com.uniminuto.clinica.entity.Cliente;
import com.uniminuto.clinica.exception.BadRequestException;
import com.uniminuto.clinica.service.ClienteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

/** Atiende las peticiones relacionadas con un propietario de mascotas. */
@RestController
public class ClienteApiController implements ClienteApi {

    @Autowired
    private ClienteService clienteService;


    /** Consulta los propietarios registrados. */
    @Override
    public ResponseEntity<List<Cliente>> listarClientes() throws BadRequestException {
        return ResponseEntity.ok(this.clienteService.listarClientes());
    }

    /** Consulta los propietarios que coinciden con el número de documento. */
    @Override
    public ResponseEntity<Cliente> getClientesByNumeroDocumento(String numeroDocumento) throws BadRequestException {
        return ResponseEntity.ok(this.clienteService.getClienteByNumeroDocumento(numeroDocumento));
    }
}
