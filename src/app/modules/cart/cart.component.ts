import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CartService } from 'src/app/core/services/cart.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { CartItem } from './models/cart-item.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];
  totalItems = 0;
  total = 0;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private themeService: ThemeService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get currentUserName(): string {
    return this.authService.currentUserData?.name || 'Usuario';
  }

  get currentUserRoleLabel(): string {
    return this.isAdmin ? 'Administrador' : 'Cliente';
  }

  get isDarkTheme(): boolean {
    return this.themeService.isDarkTheme;
  }

  ngOnInit(): void {
    if (this.isAdmin) {
      this.router.navigate(['/orders']);
      return;
    }

    this.cartService.cart$.subscribe((items) => {
      const summary = this.cartService.summary;
      this.items = items;
      this.totalItems = summary.totalItems;
      this.total = summary.total;
    });
  }

  increaseQuantity(item: CartItem): void {
    if (item.quantity >= item.stock) {
      this.snackBar.open('No podés superar el stock disponible.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.cartService.updateQuantity(item.id, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity <= 1) {
      this.removeItem(item);
      return;
    }

    this.cartService.updateQuantity(item.id, item.quantity - 1);
  }

  removeItem(item: CartItem): void {
    this.cartService.removeProduct(item.id);
    this.snackBar.open(`${item.name} fue eliminado del carrito.`, 'Cerrar', { duration: 2800 });
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.snackBar.open('El carrito quedó vacío.', 'Cerrar', { duration: 2800 });
  }

  goToCheckout(): void {
    if (!this.items.length) {
      this.snackBar.open('Agregá al menos un producto antes de continuar.', 'Cerrar', { duration: 3200 });
      return;
    }

    this.router.navigate(['/checkout']);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
