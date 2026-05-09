import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { CartService } from 'src/app/core/services/cart.service';
import { PaymentService } from 'src/app/core/services/payment.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { CartItem } from '../cart/models/cart-item.model';
import { CheckoutFormValue, CreateOrderPayload } from './models/checkout.model';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  items: CartItem[] = [];
  totalItems = 0;
  total = 0;
  submitting = false;

  readonly checkoutForm = this.fb.nonNullable.group({
    street: ['', [Validators.required, Validators.minLength(3)]],
    city: ['', [Validators.required, Validators.minLength(2)]],
    state: [''],
    postalCode: [''],
    country: ['Argentina', [Validators.required, Validators.minLength(2)]],
    paymentMethod: ['mercado-pago', Validators.required]
  });

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private paymentService: PaymentService,
    private themeService: ThemeService,
    private snackBar: MatSnackBar,
    private router: Router,
    private fb: FormBuilder
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

  ngOnInit(): void {
    if (this.authService.isAdmin()) {
      this.router.navigate(['/orders']);
      return;
    }

    const summary = this.cartService.summary;
    this.items = summary.items;
    this.totalItems = summary.totalItems;
    this.total = summary.total;

    if (!this.items.length) {
      this.router.navigate(['/cart']);
    }
  }

  submitCheckout(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.snackBar.open('Completá los datos obligatorios antes de continuar.', 'Cerrar', { duration: 3200 });
      return;
    }

    this.submitting = true;
    const checkoutFormValue: CheckoutFormValue = {
      ...this.checkoutForm.getRawValue(),
      paymentMethod: 'mercado-pago'
    };

    const orderPayload: CreateOrderPayload = {
      items: this.paymentService.buildOrderItemsPayload(),
      currency: 'ARS',
      address: {
        street: checkoutFormValue.street,
        city: checkoutFormValue.city,
        state: checkoutFormValue.state || undefined,
        postalCode: checkoutFormValue.postalCode || undefined,
        country: checkoutFormValue.country
      }
    };

    this.paymentService.createOrder(orderPayload).pipe(
      switchMap((order) => this.paymentService.createOrderPayment(order.id)),
      finalize(() => {
        this.submitting = false;
      })
    ).subscribe({
      next: (result) => {
        if (!result.redirectUrl) {
          this.router.navigateByUrl(`/checkout/result?orderId=${result.orderId}&status=${result.status}`);
          return;
        }

        window.location.href = result.redirectUrl;
      },
      error: (error) => {
        const message = error?.error?.message || error?.message || 'No se pudo iniciar el pago.';
        this.snackBar.open(message, 'Cerrar', { duration: 3600 });
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
}
