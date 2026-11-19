package com.uniminuto.clinica.serviceimpl;

import com.uniminuto.clinica.entity.FormulaMedica;
import com.uniminuto.clinica.repository.FormulaMedicaRepository;
import com.uniminuto.clinica.service.FormulaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/** Implementa las operaciones relacionadas con la prescripción médica. */
@Service
public class FormulaServiceImpl implements FormulaService {

    @Autowired
    private FormulaMedicaRepository formulaMedicaRepository;

    /** Consulta las fórmulas médicas registradas. */
    @Override
    public List<FormulaMedica> findAllFormulas() {
        return formulaMedicaRepository.findAllByOrderByFechaCreacionRegistroDesc();
    }
}
