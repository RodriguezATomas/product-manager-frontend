import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { PaymentService } from 'src/app/core/services/payment.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { Order } from '../checkout/models/checkout.model';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;

  constructor(
    private authService: AuthService,
    private paymentService: PaymentService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get currentUserName(): string {
    return this.authService.currentUserData?.name || 'Usuario';
  }

  get currentUserRoleLabel(): string {
    return 'Administrador';
  }

  get isDarkTheme(): boolean {
    return this.themeService.isDarkTheme;
  }

  ngOnInit(): void {
    if (!this.isAdmin) {
      this.router.navigate(['/products']);
      return;
    }

    this.loading = true;
    this.paymentService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: () => {
        this.orders = [];
        this.loading = false;
      }
    });
  }

  getStatusLabel(status: Order['payment']['status']): string {
    if (status === 'approved') {
      return 'Aprobada';
    }

    if (status === 'failed' || status === 'cancelled') {
      return 'Rechazada';
    }

    return 'Pendiente';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
