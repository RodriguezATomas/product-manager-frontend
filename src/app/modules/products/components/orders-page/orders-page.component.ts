import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { Purchase, CartService } from '../../services/cart.service';

@Component({
  selector: 'app-orders-page',
  templateUrl: './orders-page.component.html',
  styleUrls: ['./orders-page.component.css']
})
export class OrdersPageComponent implements OnInit {
  purchases: Purchase[] = [];
  selectedPurchase: Purchase | null = null;

  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const currentUserName = this.authService.currentUserData?.name || 'Usuario';
    this.cartService.getPurchases(currentUserName).subscribe({
      next: (purchases) => {
        this.purchases = purchases;
      },
      error: () => {
        this.purchases = [];
      }
    });
  }

  selectPurchase(purchase: Purchase): void {
    this.selectedPurchase = purchase;
  }

  backToOrders(): void {
    this.selectedPurchase = null;
  }
}
