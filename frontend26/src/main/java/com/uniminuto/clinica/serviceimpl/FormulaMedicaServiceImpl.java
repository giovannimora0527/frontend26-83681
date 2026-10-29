package com.uniminuto.clinica.serviceimpl;

import com.uniminuto.clinica.entity.Cita;
import com.uniminuto.clinica.entity.FormulaMedica;
import com.uniminuto.clinica.entity.Medicamento;
import com.uniminuto.clinica.exception.BadRequestException;
import com.uniminuto.clinica.models.FormulaMedicaRq;
import com.uniminuto.clinica.models.MiRespuestaRS;
import com.uniminuto.clinica.repository.CitaRepository;
import com.uniminuto.clinica.repository.FormulaMedicaRepository;
import com.uniminuto.clinica.repository.MedicamentoRepository;
import com.uniminuto.clinica.service.FormulaMedicaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FormulaMedicaServiceImpl implements FormulaMedicaService {

    @Autowired
    private FormulaMedicaRepository formulaMedicaRepository;

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private MedicamentoRepository medicamentoRepository;

    @Override
    public List<FormulaMedica> listarFormulasMedicas() throws BadRequestException {
        return this.formulaMedicaRepository.findAllByOrderByFechaCreacionRegistroDesc();
    }

    @Override
    public FormulaMedica buscarFormulaMedica(Long id) throws BadRequestException {
        if (id == null) {
            throw new BadRequestException("El ID de la fórmula médica es obligatorio");
        }
        return this.formulaMedicaRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("La fórmula médica con ID " + id + " no fue encontrada"));
    }

    @Override
    public MiRespuestaRS crearFormulaMedica(FormulaMedicaRq rq) throws BadRequestException {
        // Paso 1. Validar los campos obligatorios.
        this.validarObjetoEntrada(rq, true);

        // Paso 2. Validar las entidades relacionadas y las reglas de negocio.
        Cita cita = this.obtenerCitaValida(rq);
        Medicamento medicamento = this.obtenerMedicamento(rq.getMedicamentoId());

        // Paso 3. Construir y guardar la fórmula.
        FormulaMedica formula = new FormulaMedica();
        this.copiarDatos(rq, formula, cita, medicamento);
        formula.setFechaCreacionRegistro(LocalDateTime.now());
        this.formulaMedicaRepository.save(formula);

        return this.construirRespuesta("Fórmula médica creada correctamente");
    }

    @Override
    public MiRespuestaRS actualizarFormulaMedica(FormulaMedicaRq rq) throws BadRequestException {
        // Paso 1. Validar los campos obligatorios, incluyendo el identificador.
        this.validarObjetoEntrada(rq, false);

        // Paso 2. Validar que la fórmula exista.
        FormulaMedica formula = this.formulaMedicaRepository.findById(rq.getId())
                .orElseThrow(() -> new BadRequestException("La fórmula médica con ID " + rq.getId() + " no fue encontrada"));

        // Paso 3. Una fórmula no puede moverse a una consulta de otra mascota.
        Cita cita = this.obtenerCitaValida(rq);
        if (formula.getCita() != null && formula.getCita().getMascota() != null
                && cita.getMascota() != null
                && !formula.getCita().getMascota().getMascotaId().equals(cita.getMascota().getMascotaId())) {
            throw new BadRequestException("La fórmula no puede asociarse a una consulta perteneciente a otra mascota");
        }
        Medicamento medicamento = this.obtenerMedicamento(rq.getMedicamentoId());

        // Paso 4. Actualizar los datos permitidos.
        this.copiarDatos(rq, formula, cita, medicamento);
        formula.setFechaActualizacionRegistro(LocalDateTime.now());
        this.formulaMedicaRepository.save(formula);

        return this.construirRespuesta("Fórmula médica actualizada correctamente");
    }

    private void copiarDatos(FormulaMedicaRq rq, FormulaMedica formula, Cita cita, Medicamento medicamento) {
        formula.setCita(cita);
        formula.setMedicamento(medicamento);
        formula.setDosis(rq.getDosis().trim());
        formula.setIndicaciones(rq.getIndicaciones() == null ? null : rq.getIndicaciones().trim());
    }

    /**
     * Busca la cita y valida las reglas de negocio que dependen de ella:
     * mascota existente con cliente registrado, veterinario existente,
     * cita no cancelada y fecha de emisión no anterior a la fecha de la cita.
     */
    private Cita obtenerCitaValida(FormulaMedicaRq rq) throws BadRequestException {
        Cita cita = this.citaRepository.findById(rq.getCitaId())
                .orElseThrow(() -> new BadRequestException("La cita con ID " + rq.getCitaId() + " no existe en la base de datos"));

        if (cita.getMascota() == null) {
            throw new BadRequestException("No se puede crear una fórmula para una mascota inexistente");
        }
        if (cita.getMascota().getCliente() == null) {
            throw new BadRequestException("La mascota debe pertenecer a un cliente registrado");
        }
        if (cita.getMedico() == null) {
            throw new BadRequestException("El veterinario asociado a la cita no existe en el sistema");
        }
        if (cita.getEstado() != null && "CANCELADA".equalsIgnoreCase(cita.getEstado().trim())) {
            throw new BadRequestException("No se puede asociar una fórmula a una cita cancelada");
        }
        if (cita.getFechaHora() != null && LocalDateTime.now().isBefore(cita.getFechaHora())) {
            throw new BadRequestException("La fecha de emisión no puede ser anterior a la fecha de la consulta asociada");
        }
        return cita;
    }

    private Medicamento obtenerMedicamento(Long medicamentoId) throws BadRequestException {
        return this.medicamentoRepository.findById(medicamentoId)
                .orElseThrow(() -> new BadRequestException("El medicamento con ID " + medicamentoId + " no existe en la base de datos"));
    }

    private MiRespuestaRS construirRespuesta(String mensaje) {
        MiRespuestaRS respuesta = new MiRespuestaRS();
        respuesta.setStatus(200);
        respuesta.setMessage(mensaje);
        return respuesta;
    }

    private void validarObjetoEntrada(FormulaMedicaRq rq, boolean esCreacion) throws BadRequestException {
        if (rq == null) {
            throw new BadRequestException("El objeto de entrada no puede estar vacío");
        }
        if (!esCreacion && rq.getId() == null) {
            throw new BadRequestException("El ID de la fórmula médica es obligatorio para actualizar");
        }
        if (rq.getCitaId() == null) {
            throw new BadRequestException("La cita (consulta) es obligatoria");
        }
        if (rq.getMedicamentoId() == null) {
            throw new BadRequestException("El medicamento es obligatorio");
        }
        if (rq.getDosis() == null || rq.getDosis().trim().isEmpty()) {
            throw new BadRequestException("La dosis es obligatoria");
        }
        if (rq.getDosis().trim().length() > 500) {
            throw new BadRequestException("La dosis no puede superar los 500 caracteres");
        }
        if (!this.contieneNumeroPositivo(rq.getDosis())) {
            throw new BadRequestException("La dosis debe indicar un valor numérico válido (ej. 800 mg)");
        }
        if (rq.getIndicaciones() != null && rq.getIndicaciones().trim().length() > 2000) {
            throw new BadRequestException("Las indicaciones no pueden superar los 2000 caracteres");
        }
    }

    /**
     * Verifica que el texto contenga al menos un número mayor a cero.
     */
    private boolean contieneNumeroPositivo(String texto) {
        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("\\d+([.,]\\d+)?").matcher(texto);
        while (matcher.find()) {
            double valor = Double.parseDouble(matcher.group().replace(',', '.'));
            if (valor > 0) {
                return true;
            }
        }
        return false;
    }
}