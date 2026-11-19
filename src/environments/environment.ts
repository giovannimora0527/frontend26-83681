import packageInfo from '../../package.json';

const apiUrlAuth = 'http://localhost:8080/clinica/v1';

/** Define la dirección del servidor y los valores usados en este entorno. */
export const environment = {
  appVersion: packageInfo.version,
  production: false,  
  apiUrlAuth,
  swaggerUrl: `${apiUrlAuth}/swagger-ui/index.html#/`
};
