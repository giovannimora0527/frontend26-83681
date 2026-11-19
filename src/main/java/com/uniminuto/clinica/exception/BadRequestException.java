package com.uniminuto.clinica.exception;

import org.springframework.http.HttpStatus;

/**
 * Clase de excepción personalizada para manejar errores de solicitud incorrecta (Bad Request).
 */
public class BadRequestException extends RuntimeException {

    private final HttpStatus status;

    /** Prepara los datos necesarios para usar esta clase. */
    public BadRequestException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST;
    }

    /** Devuelve el estado HTTP asociado al error. */
    public HttpStatus getStatus() {
        return status;
    }
}
