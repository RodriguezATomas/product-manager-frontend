import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  pageTitle = 'Panel principal';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updatePageTitle();
      });

    this.updatePageTitle();
  }

  get currentUserName(): string {
    return this.authService.currentUserData?.name || 'Admin';
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get currentUserRoleLabel(): string {
    return this.isAdmin ? 'Administrador' : 'Usuario';
  }

  get userHomeRoute(): string {
    return this.isAdmin ? '/dashboard' : '/products';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  private updatePageTitle(): void {
    const currentUrl = this.router.url;

    if (currentUrl.includes('/products')) {
      this.pageTitle = 'Productos';
      return;
    }

    if (currentUrl.includes('/users')) {
      this.pageTitle = 'Usuarios';
      return;
    }

    if (currentUrl.includes('/repairs')) {
      this.pageTitle = 'Reparaciones';
      return;
    }

    if (currentUrl.includes('/profile')) {
      this.pageTitle = 'Perfil';
      return;
    }

    this.pageTitle = 'Panel principal';
  }
}
