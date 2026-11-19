import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  // Conserva la ruta de la API configurada por el backend en los perfiles dev y prod.
  apiUrlAuth: 'http://localhost:8080/clinica/v1'
};
