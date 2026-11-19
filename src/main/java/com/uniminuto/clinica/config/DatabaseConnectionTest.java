package com.uniminuto.clinica.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

/** Comprueba la conexión de la aplicación con la base de datos. */
@Component
public class DatabaseConnectionTest implements CommandLineRunner {

    private final DataSource dataSource;

    /** Prepara los datos necesarios para usar esta clase. */
    public DatabaseConnectionTest(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /** Ejecuta la comprobación de la conexión al iniciar la aplicación. */
    @Override
    public void run(String... args) throws Exception {

        try (var connection = dataSource.getConnection()) {

            System.out.println("==========================================");
            System.out.println("CONEXIÓN A BASE DE DATOS");
            System.out.println("==========================================");
            System.out.println("URL      : "
                    + connection.getMetaData().getURL());
            System.out.println("USUARIO  : "
                    + connection.getMetaData().getUserName());
            System.out.println("DRIVER   : "
                    + connection.getMetaData().getDriverName());
            System.out.println("DATABASE : "
                    + connection.getCatalog());
            System.out.println("==========================================");
        }
    }
}