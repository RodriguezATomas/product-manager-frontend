import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'project-manager-frontend';
  currentUrl = '';

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    this.currentUrl = this.router.url;

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.currentUrl = event.urlAfterRedirects;
    });
  }

  get showNavbar(): boolean {
    return this.authService.isAuthenticated() && !this.currentUrl.startsWith('/auth');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
