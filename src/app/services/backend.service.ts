import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  constructor(private http: HttpClient) { }

  private headers(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  /** Requests to endpoints whose path does not follow the legacy endpoint/service pattern. */
  getPath<T>(urlApi: string, path: string, params?: HttpParams) {
    return this.http.get<T>(`${urlApi}/${path.replace(/^\/+/, '')}`, { headers: this.headers(), params });
  }

  postPath<T>(urlApi: string, path: string, data: unknown) {
    return this.http.post<T>(`${urlApi}/${path.replace(/^\/+/, '')}`, data, { headers: this.headers() });
  }

  putPath<T>(urlApi: string, path: string, data: unknown) {
    return this.http.put<T>(`${urlApi}/${path.replace(/^\/+/, '')}`, data, { headers: this.headers() });
  }

  getBlob(urlApi: string, path: string, params?: HttpParams) {
    return this.http.get(`${urlApi}/${path.replace(/^\/+/, '')}`, {
      headers: this.headers(), params, responseType: 'blob'
    });
  }

  postFile<T>(urlApi: string, endpoint: string, service: string, data: FormData) {
    return this.http.post<T>(`${urlApi}/${endpoint}/${service}`, data, { headers: this.headers() });
  }

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
  get<T>(
    urlApi: string,
    endpoint: string,
    service: string,
    routerParams?: HttpParams
  ) {
    const headers = this.headers();
    return this.http.get<T>(`${urlApi}/${endpoint}/${service}`, {
      params: routerParams,
      headers: headers,
    });
  }


  // Servicio generico para realizar peticiones POST al backend.
  post<T>(
    urlApi: string,
    endpoint: string,
    service: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
  ): Observable<T> {
    const headers = this.headers();
    return this.http.post<T>(`${urlApi}/${endpoint}/${service}`, data, {
      headers: headers,
    });
  }

  // Servicio generico para realizar peticiones PUT al backend.
  put<T>(
    urlApi: string,
    endpoint: string,
    service: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
  ): Observable<T> {
    const headers = this.headers();
    return this.http.put<T>(`${urlApi}/${endpoint}/${service}`, data, {
      headers: headers,
    });
  }

}
