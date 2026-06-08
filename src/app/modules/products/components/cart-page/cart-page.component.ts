import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/core/services/auth.service';
import { environment } from 'src/environments/environment';
import { CartItem, CartService, Purchase } from '../../services/cart.service';

@Component({
  selector: 'app-cart-page',
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.css']
})
export class CartPageComponent {
  readonly shippingCost = 5000;
  readonly fallbackProductImage = 'assets/images/esueldos-logo-azul.png';
  paymentMethod = 'cash';
  confirmedPurchase: Purchase | null = null;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {}

  get cartItems(): CartItem[] {
    return this.cartService.getItems();
  }

  get subtotal(): number {
    return this.cartService.getSubtotal();
  }

  get total(): number {
    return this.subtotal + (this.cartItems.length ? this.shippingCost : 0);
  }

  updateQuantity(productId: string, value: string): void {
    this.cartService.updateQuantity(productId, Number(value));
  }

  decreaseQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.product._id, item.quantity - 1);
  }

  increaseQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.product._id, item.quantity + 1);
  }

  removeProduct(productId: string): void {
    this.cartService.removeProduct(productId);
  }

  getItemSubtotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }

  getProductImage(item: CartItem): string {
    if (!item.product.imageUrl) {
      return this.fallbackProductImage;
    }

    return `${environment.apiUrl}${item.product.imageUrl}`;
  }

  finishPurchase(): void {
    const purchase = this.cartService.completePurchase(
      this.authService.currentUserData?.name || 'Usuario',
      this.paymentMethod,
      this.shippingCost
    );

    if (!purchase) {
      this.snackBar.open('Selecciona efectivo para confirmar la compra.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.confirmedPurchase = purchase;
    this.snackBar.open(`Compra ${purchase.id} confirmada.`, 'Cerrar', { duration: 3000 });
  }
}
