import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const user = this.authService.currentUserValue;
    
    // Si hay usuario, inyectamos el token en el header
    if (user) {
      const token = user?.tokens?.access?.token || user?.token;
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(request).pipe(
      catchError(err => {
        // Si el servidor responde 401, significa que el token expiró
        if (err.status === 401) {
          this.authService.logout();
          // No recargamos para evitar bucle infinito
        }
        return throwError(() => err);
      })
    );
  }
}