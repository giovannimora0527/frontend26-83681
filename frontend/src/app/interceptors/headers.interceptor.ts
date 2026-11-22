import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpContext, HttpContextToken, HttpHeaders } from '@angular/common/http';


@Injectable()
export class HeadersInterceptor implements HttpInterceptor {

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Las cargas de archivos (multipart) deben conservar el Content-Type con boundary que fija el navegador.
    if (req.body instanceof FormData) {
      return next.handle(req);
    }
    const clonedRequest = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
      },
    });
    const hasContentType = clonedRequest.headers.has('Content-Type');

    return next.handle(clonedRequest);
  }

  addHeaders(request: HttpRequest<unknown>): HttpRequest<any> {
    return (request = request.clone({
      setHeaders: {
        'Content-Type': 'application/json',
      },
    }));
  }
}