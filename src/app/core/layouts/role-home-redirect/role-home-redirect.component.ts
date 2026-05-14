import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-role-home-redirect',
  template: ''
})
export class RoleHomeRedirectComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.router.navigate([this.authService.isAdmin() ? '/dashboard' : '/products']);
  }
}
