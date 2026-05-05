import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ThemeService } from 'src/app/core/services/theme.service';

interface DashboardShortcut {
  title: string;
  description: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  get currentUserName(): string {
    return this.authService.currentUserData?.name || 'Usuario';
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get currentUserRoleLabel(): string {
    return this.isAdmin ? 'Administrador' : 'Usuario';
  }

  get isDarkTheme(): boolean {
    return this.themeService.isDarkTheme;
  }

  get shortcuts(): DashboardShortcut[] {
    const items: DashboardShortcut[] = [
      {
        title: 'Productos',
        description: this.isAdmin ? 'Gestiona el catalogo, precios y stock.' : 'Consulta el catalogo disponible.',
        icon: 'inventory_2',
        route: '/products'
      },
      {
        title: 'Perfil',
        description: 'Actualiza tus datos personales y revisa tu cuenta.',
        icon: 'account_circle',
        route: '/profile'
      }
    ];

    if (this.isAdmin) {
      items.splice(1, 0, {
        title: 'Usuarios',
        description: 'Administra accesos, roles y verificaciones.',
        icon: 'groups',
        route: '/users'
      });
    }

    return items;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
