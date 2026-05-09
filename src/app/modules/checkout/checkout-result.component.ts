import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { PaymentService } from 'src/app/core/services/payment.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { Order, PaymentStatus } from './models/checkout.model';

@Component({
  selector: 'app-checkout-result',
  templateUrl: './checkout-result.component.html',
  styleUrls: ['./checkout-result.component.css']
})
export class CheckoutResultComponent implements OnInit {
  order: Order | null = null;
  status: PaymentStatus = 'pending';
  loading = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private paymentService: PaymentService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  get currentUserName(): string {
    return this.authService.currentUserData?.name || 'Usuario';
  }

  get currentUserRoleLabel(): string {
    return this.authService.isAdmin() ? 'Administrador' : 'Cliente';
  }

  get isDarkTheme(): boolean {
    return this.themeService.isDarkTheme;
  }

  get title(): string {
    if (this.status === 'approved') {
      return 'Pago aprobado';
    }

    if (this.status === 'failed' || this.status === 'cancelled') {
      return 'Pago rechazado';
    }

    return 'Pago pendiente';
  }

  get description(): string {
    if (this.status === 'approved') {
      return 'La orden quedó registrada y el backend ya confirmó el pago.';
    }

    if (this.status === 'failed' || this.status === 'cancelled') {
      return 'El pago no fue aprobado. Podés volver al carrito o reintentar la compra cuando quieras.';
    }

    return 'La orden fue creada y el pago todavía está pendiente de confirmación.';
  }

  ngOnInit(): void {
    if (this.authService.isAdmin()) {
      this.router.navigate(['/orders']);
      return;
    }

    const queryStatus = this.activatedRoute.snapshot.queryParamMap.get('status');
    const orderId =
      this.activatedRoute.snapshot.queryParamMap.get('orderId') ||
      this.activatedRoute.snapshot.queryParamMap.get('external_reference') ||
      this.paymentService.getLastOrderId();

    this.paymentService.getOrderById(orderId).subscribe({
      next: (order) => {
        this.loading = false;

        if (!order) {
          this.router.navigate(['/products']);
          return;
        }

        this.order = order;
        this.status = order.payment.status || this.mapStatusFromQuery(queryStatus);
      },
      error: () => {
        this.loading = false;
        this.status = this.mapStatusFromQuery(queryStatus);
      }
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  private mapStatusFromQuery(status: string | null): PaymentStatus {
    if (status === 'success') {
      return 'approved';
    }

    if (status === 'failure') {
      return 'failed';
    }

    return 'pending';
  }
}
