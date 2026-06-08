import { Component } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { Purchase, CartService } from '../../services/cart.service';

@Component({
  selector: 'app-orders-page',
  templateUrl: './orders-page.component.html',
  styleUrls: ['./orders-page.component.css']
})
export class OrdersPageComponent {
  selectedPurchase: Purchase | null = null;

  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) {}

  get purchases(): Purchase[] {
    const currentUserName = this.authService.currentUserData?.name || 'Usuario';
    return this.cartService.getPurchases().filter((purchase) => purchase.user === currentUserName);
  }

  selectPurchase(purchase: Purchase): void {
    this.selectedPurchase = purchase;
  }
}
