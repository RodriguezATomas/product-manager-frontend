import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const user = this.authService.currentUserValue;
    // Verifica si hay un token real (no undefined ni null)
    const token = user?.tokens?.access?.token || user?.token;
    
    if (token && token !== 'undefined') {
      return true;
    }
    // Si no, lo enviamos al login
    this.router.navigate(['/auth']);
    return false;
  }
}