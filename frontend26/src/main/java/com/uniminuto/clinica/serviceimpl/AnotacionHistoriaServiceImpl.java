package com.uniminuto.clinica.serviceimpl;

import com.uniminuto.clinica.entity.AnotacionHistoria;
import com.uniminuto.clinica.entity.HistoriaMedica;
import com.uniminuto.clinica.entity.Medico;
import com.uniminuto.clinica.exception.BadRequestException;
import com.uniminuto.clinica.models.AnotacionHistoriaRq;
import com.uniminuto.clinica.models.MiRespuestaRS;
import com.uniminuto.clinica.repository.AnotacionHistoriaRepository;
import com.uniminuto.clinica.repository.HistoriaMedicaRepository;
import com.uniminuto.clinica.repository.MedicoRepository;
import com.uniminuto.clinica.service.AnotacionHistoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AnotacionHistoriaServiceImpl implements AnotacionHistoriaService {

    @Autowired
    private AnotacionHistoriaRepository anotacionHistoriaRepository;

    @Autowired
    private HistoriaMedicaRepository historiaMedicaRepository;

    @Autowired
    private MedicoRepository medicoRepository;

    @Override
    public MiRespuestaRS crearAnotacionHistoria(AnotacionHistoriaRq anotacionHistoriaRq) throws BadRequestException {
        // Paso 1. Validar los campos obligatorios del objeto de entrada.
        this.validarObjetoEntrada(anotacionHistoriaRq, true);

        // Paso 2. Construir la anotación con las entidades relacionadas ya validadas.
        AnotacionHistoria anotacion = new AnotacionHistoria();
        anotacion.setHistoria(this.obtenerHistoria(anotacionHistoriaRq.getHistoriaId()));
        anotacion.setMedico(this.obtenerMedico(anotacionHistoriaRq.getMedicoId()));
        anotacion.setDescripcion(anotacionHistoriaRq.getDescripcion());
        anotacion.setFecha(LocalDateTime.now());

        this.anotacionHistoriaRepository.save(anotacion);

        // Paso 3. Retornar la respuesta de la operación.
        return this.construirRespuesta("Anotación de historia creada correctamente");
    }

    @Override
    public List<AnotacionHistoria> listarAnotacionesHistoria(Long historiaId) throws BadRequestException {
        // Paso 1. Validar que se haya enviado el identificador de la historia.
        if (historiaId == null) {
            throw new BadRequestException("El ID de la historia médica no puede estar vacío");
        }

        // Paso 2. Validar que la historia médica exista.
        this.obtenerHistoria(historiaId);

        // Paso 3. Consultar las anotaciones, ya ordenadas descendentemente.
        return this.anotacionHistoriaRepository.findByHistoria_IdOrderByFechaDesc(historiaId);
    }

    @Override
    public List<AnotacionHistoria> listarTodasLasAnotaciones() throws BadRequestException {
        return this.anotacionHistoriaRepository.findAllByOrderByFechaDesc();
    }

    @Override
    public MiRespuestaRS actualizarAnotacionHistoria(AnotacionHistoriaRq anotacionHistoriaRq) throws BadRequestException {
        // Paso 1. Validar los campos obligatorios, incluyendo el identificador.
        this.validarObjetoEntrada(anotacionHistoriaRq, false);

        // Paso 2. Validar que la anotación a actualizar exista.
        Optional<AnotacionHistoria> optAnotacion = this.anotacionHistoriaRepository.findById(anotacionHistoriaRq.getId());
        if (optAnotacion.isEmpty()) {
            throw new BadRequestException("La anotación con ID " + anotacionHistoriaRq.getId() + " no existe en la base de datos");
        }

        // Paso 3. Actualizar los datos con las entidades relacionadas ya validadas.
        AnotacionHistoria anotacion = optAnotacion.get();
        anotacion.setHistoria(this.obtenerHistoria(anotacionHistoriaRq.getHistoriaId()));
        anotacion.setMedico(this.obtenerMedico(anotacionHistoriaRq.getMedicoId()));
        anotacion.setDescripcion(anotacionHistoriaRq.getDescripcion());

        this.anotacionHistoriaRepository.save(anotacion);

        // Paso 4. Retornar la respuesta de la operación.
        return this.construirRespuesta("Anotación de historia actualizada correctamente");
    }

    /**
     * Busca una historia médica por su identificador y valida que exista.
     */
    private HistoriaMedica obtenerHistoria(Long historiaId) throws BadRequestException {
        return this.historiaMedicaRepository.findById(historiaId)
                .orElseThrow(() -> new BadRequestException("La historia médica con ID " + historiaId + " no existe en la base de datos"));
    }

    /**
     * Busca un médico por su identificador y valida que exista.
     */
    private Medico obtenerMedico(Long medicoId) throws BadRequestException {
        return this.medicoRepository.findById(medicoId)
                .orElseThrow(() -> new BadRequestException("El médico con ID " + medicoId + " no existe en la base de datos"));
    }

    /**
     * Construye una respuesta exitosa estándar para las operaciones del servicio.
     */
    private MiRespuestaRS construirRespuesta(String mensaje) {
        MiRespuestaRS respuesta = new MiRespuestaRS();
        respuesta.setStatus(200);
        respuesta.setMessage(mensaje);
        return respuesta;
    }

    /**
     * Valida los campos obligatorios de una solicitud de anotación.
     */
    private void validarObjetoEntrada(AnotacionHistoriaRq anotacionHistoriaRq, boolean esCreacion) throws BadRequestException {
        if (anotacionHistoriaRq == null) {
            throw new BadRequestException("El objeto de entrada no puede estar vacío");
        }

        if (!esCreacion && anotacionHistoriaRq.getId() == null) {
            throw new BadRequestException("El ID de la anotación es obligatorio para actualizar");
        }

        if (anotacionHistoriaRq.getHistoriaId() == null) {
            throw new BadRequestException("El ID de la historia médica no puede estar vacío");
        }

        if (anotacionHistoriaRq.getMedicoId() == null) {
            throw new BadRequestException("El ID del médico no puede estar vacío");
        }

        if (anotacionHistoriaRq.getDescripcion() == null || anotacionHistoriaRq.getDescripcion().trim().isEmpty()) {
            throw new BadRequestException("La descripción de la anotación no puede estar vacía");
        }
    }
}