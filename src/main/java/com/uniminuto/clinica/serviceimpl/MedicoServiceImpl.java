package com.uniminuto.clinica.serviceimpl;

import com.uniminuto.clinica.entity.Medico;
import com.uniminuto.clinica.exception.BadRequestException;
import com.uniminuto.clinica.repository.MedicoRepository;
import com.uniminuto.clinica.service.MedicoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/** Implementa las operaciones relacionadas con un veterinario. */
@Service
public class MedicoServiceImpl implements MedicoService {

    @Autowired
    private  MedicoRepository medicoRepository;

    /** Consulta los veterinarios registrados. */
    @Override
    public List<Medico> listarMedicos() {
        return medicoRepository.findAll();
    }

    /** Busca el veterinario que coincide con el criterio indicado. */
    @Override
    public Medico buscarMedico(String tipoDocumento, String numeroDocumento) throws BadRequestException {
        if (numeroDocumento == null || numeroDocumento.isEmpty()) {
            throw new BadRequestException("El número de documento es obligatorio");
        }
        if (tipoDocumento == null || tipoDocumento.isEmpty()) {
            throw new BadRequestException("El tipo de documento es obligatorio");
        }

        Optional<Medico> medico = medicoRepository.findByTipoDocumentoAndNumeroDocumento(tipoDocumento, numeroDocumento);
        if (medico.isEmpty()) {
            throw new BadRequestException("Medico no encontrado");
        }

        return medico.get();
    }

    /** Busca un veterinario por su registro profesional. */
    @Override
    public Medico buscarMedicoPorRegistroProfesional(String registroProfesional) throws BadRequestException {
        if (registroProfesional == null || registroProfesional.isEmpty()) {
            throw new BadRequestException("El registro profesional es obligatorio");
        }

        Optional<Medico> medico = medicoRepository.findByRegistroProfesional(registroProfesional);
        if (medico.isEmpty()) {
            throw new BadRequestException("Medico no encontrado");
        }

        return medico.get();
    }
}
