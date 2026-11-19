import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpContext, HttpContextToken, HttpHeaders } from '@angular/common/http';


/** Aplica el tipo de contenido JSON al reenviar peticiones al servidor. */
@Injectable()
export class HeadersInterceptor implements HttpInterceptor {

  /** Clona la petición con el encabezado JSON y la pasa al siguiente manejador. */
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const clonedRequest = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
      },
    });
    const hasContentType = clonedRequest.headers.has('Content-Type');

    return next.handle(clonedRequest);
  }

  /** Devuelve una copia de la petición con el encabezado de contenido JSON. */
  addHeaders(request: HttpRequest<unknown>): HttpRequest<any> {
    return (request = request.clone({
      setHeaders: {
        'Content-Type': 'application/json',
      },
    }));
  }
}