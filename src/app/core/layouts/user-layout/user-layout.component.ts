import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-user-layout',
  templateUrl: './user-layout.component.html',
  styleUrls: ['./user-layout.component.css']
})
export class UserLayoutComponent {
  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  get currentUserName(): string {
    return this.authService.currentUserData?.name || 'Usuario';
  }

  get isDarkTheme(): boolean {
    return this.themeService.isDarkTheme;
  }

  get userHomeRoute(): string {
    return this.authService.isAdmin() ? '/dashboard' : '/products/home';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
