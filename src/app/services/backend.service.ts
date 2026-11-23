import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  constructor(private http: HttpClient) { }

  // Servicio generico para realizar peticiones GET al backend.
  get<T>(
    urlApi: string,
    endpoint: string,
    service: string,
    routerParams?: HttpParams
  ) {
    return this.http.get<T>(`${urlApi}/${endpoint}/${service}`, {
      params: routerParams,
    });
  }


  // Servicio generico para realizar peticiones POST al backend.
  post<T>(
    urlApi: string,
    endpoint: string,
    service: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
    routerParams?: HttpParams
  ): Observable<T> {
    return this.http.post<T>(`${urlApi}/${endpoint}/${service}`, data, { params: routerParams });
  }

  // Servicio generico para realizar peticiones PUT al backend.
  put<T>(
    urlApi: string,
    endpoint: string,
    service: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
  ): Observable<T> {
    return this.http.put<T>(`${urlApi}/${endpoint}/${service}`, data);
  }

  // Servicio generico para realizar peticiones POST al backend con archivos.
  postFile<T>(
    urlApi: string,
    endpoint: string,
    service: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
  ): Observable<T> {
    // Let the browser generate the multipart boundary for FormData requests.
    return this.http.post<T>(`${urlApi}/${endpoint}/${service}`, data);
  }

  download(urlApi: string, endpoint: string, service: string, routerParams?: HttpParams) {
    return this.http.get(`${urlApi}/${endpoint}/${service}`, {
      params: routerParams,
      responseType: 'blob'
    });
  }
}
