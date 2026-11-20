import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';


@Injectable()
export class HeadersInterceptor implements HttpInterceptor {

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = sessionStorage.getItem('token');
    const isMultipart = typeof FormData !== 'undefined' && req.body instanceof FormData;
    let headers = req.headers;
    if (isMultipart) headers = headers.delete('Content-Type');
    else if (req.body != null && !headers.has('Content-Type')) headers = headers.set('Content-Type', 'application/json');
    if (token && !headers.has('Authorization')) headers = headers.set('Authorization', `Bearer ${token}`);
    return next.handle(req.clone({ headers }));
  }
}
