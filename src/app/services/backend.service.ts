import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Centraliza las peticiones HTTP que realizan los servicios de la aplicación. */
@Injectable({
  providedIn: 'root',
})
export class BackendService {
  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor(private http: HttpClient) { }

  /** Prepara los encabezados de una petición con el token recuperado de la sesión. */
  construirHeader() {
    // Aqui obtenemos el token desde el session storage
    const tokenRecuperado = sessionStorage.getItem('token');
    if (tokenRecuperado != '') {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
        Authorization: 'Bearer ' + tokenRecuperado,
      });
      return headers;
    } else {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      });
      return headers;
    }
  }

  // Servicio generico para realizar peticiones GET al backend.
  /** Realiza una consulta al servidor y devuelve su respuesta. */
  get<T>(
    urlApi: string,
    endpoint: string,
    service: string,
    routerParams?: HttpParams
  ) {
    const tokenRecuperado = sessionStorage.getItem('token') || ''; // Evita `null`
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: tokenRecuperado ? `Bearer ${tokenRecuperado}` : '',
    });
    return this.http.get<T>(`${urlApi}/${endpoint}/${service}`, {
      params: routerParams,
      headers: headers,
    });
  }


  // Servicio generico para realizar peticiones POST al backend.
  /** Envía una solicitud para registrar datos en el servidor. */
  post<T>(
    urlApi: string,
    endpoint: string,
    service: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
  ): Observable<T> {
    const tokenRecuperado = sessionStorage.getItem('token') || ''; // Evita `null`
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: tokenRecuperado ? `Bearer ${tokenRecuperado}` : '',
    });
    return this.http.post<T>(`${urlApi}/${endpoint}/${service}`, data, {
      headers: headers,
    });
  }

  // Servicio generico para realizar peticiones PUT al backend.
  /** Envía una solicitud para actualizar datos en el servidor. */
  put<T>(
    urlApi: string,
    endpoint: string,
    service: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
  ): Observable<T> {
    const tokenRecuperado = sessionStorage.getItem('token') || ''; // Evita `null`
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: tokenRecuperado ? `Bearer ${tokenRecuperado}` : '',
    });
    return this.http.put<T>(`${urlApi}/${endpoint}/${service}`, data, {
      headers: headers,
    });
  }

  // Servicio generico para realizar peticiones POST al backend con archivos.
  /** Envía un archivo al servidor como parte del formulario. */
  postFile<T>(
    urlApi: string,
    endpoint: string,
    service: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
  ): Observable<T> {
    const tokenRecuperado = sessionStorage.getItem('token') || ''; // Evita `null`
    const headers = new HttpHeaders({
      mimeType: 'multipart/form-data',
      Authorization: tokenRecuperado ? `Bearer ${tokenRecuperado}` : '',
    });
    return this.http.post<T>(`${urlApi}/${endpoint}/${service}`, data, {
      headers: headers,
    });
  }
}
