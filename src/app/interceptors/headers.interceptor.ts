import { Observable, catchError, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';


@Injectable()
export class HeadersInterceptor implements HttpInterceptor {

  constructor(private readonly router: Router) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = sessionStorage.getItem('token');
    const isApiRequest = req.url.includes('/clinica/v1/');
    const hasAuthorization = req.headers.has('Authorization');
    const isPublicAuthRequest = /\/auth\/(login|validate-token|recover-password|reset-password)(\?|$)/.test(req.url);

    if (!token || !isApiRequest || hasAuthorization || isPublicAuthRequest) {
      return next.handle(req).pipe(catchError(error => this.handleUnauthorized(error)));
    }

    return next.handle(req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    })).pipe(catchError(error => this.handleUnauthorized(error)));
  }

  private handleUnauthorized(error: unknown): Observable<never> {
    if (error instanceof HttpErrorResponse && error.status === 401) {
      sessionStorage.removeItem('token');
      void this.router.navigate(['/login']);
    }
    return throwError(() => error);
  }
}
