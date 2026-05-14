import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanMatch, Route, Router, UrlSegment } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate, CanMatch {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    return this.hasAccess(route.data['roles'] as string[] | undefined, true);
  }

  canMatch(route: Route, _segments: UrlSegment[]): boolean {
    return this.hasAccess(route.data?.['roles'] as string[] | undefined, false);
  }

  private hasAccess(allowedRoles: string[] | undefined, shouldRedirect: boolean): boolean {
    if (!this.authService.isAuthenticated()) {
      if (shouldRedirect) {
        this.router.navigate(['/auth']);
      }
      return false;
    }

    if (!allowedRoles?.length || this.authService.hasRole(...allowedRoles)) {
      return true;
    }

    if (shouldRedirect) {
      this.router.navigate(['/products']);
    }
    return false;
  }
}
