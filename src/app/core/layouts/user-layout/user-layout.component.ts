import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-layout',
  templateUrl: './user-layout.component.html',
  styleUrls: ['./user-layout.component.css']
})
export class UserLayoutComponent {
  pageTitle = 'Productos';

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
    return this.authService.currentUserData?.name || 'Usuario';
  }

  get userHomeRoute(): string {
    return this.authService.isAdmin() ? '/dashboard' : '/products/home';
  }

  get currentUserRoleLabel(): string {
    return 'Usuario';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  private updatePageTitle(): void {
    const currentUrl = this.router.url;

    if (currentUrl.includes('/repairs')) {
      this.pageTitle = 'Reparaciones';
      return;
    }

    if (currentUrl.includes('/profile')) {
      this.pageTitle = 'Perfil';
      return;
    }

    if (currentUrl.includes('/products/build-pc')) {
      this.pageTitle = 'Arma tu PC';
      return;
    }

    if (currentUrl.includes('/products/orders')) {
      this.pageTitle = 'Mis pedidos';
      return;
    }

    if (currentUrl.includes('/products/home')) {
      this.pageTitle = '';
      return;
    }

    this.pageTitle = 'Productos';
  }
}
