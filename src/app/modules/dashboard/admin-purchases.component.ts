import { Component, OnInit } from '@angular/core';
import { CartService, Purchase } from '../products/services/cart.service';

@Component({
  selector: 'app-admin-purchases',
  templateUrl: './admin-purchases.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AdminPurchasesComponent implements OnInit {
  readonly pageSize = 10;
  readonly statuses = ['confirmed', 'pending', 'cancelled'];
  purchases: Purchase[] = [];
  currentPage = 1;
  selectedPurchase: Purchase | null = null;
  selectedStatus = 'confirmed';

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.getPurchases('Admin').subscribe({
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
    this.selectedStatus = purchase.status;
  }

  get pagedPurchases(): Purchase[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.purchases.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(Math.ceil(this.purchases.length / this.pageSize), 1);
  }

  previousPage(): void {
    this.currentPage = Math.max(this.currentPage - 1, 1);
  }

  nextPage(): void {
    this.currentPage = Math.min(this.currentPage + 1, this.totalPages);
  }

  deletePurchase(purchase: Purchase): void {
    if (!confirm(`Eliminar venta ${purchase.id}?`)) {
      return;
    }

    this.cartService.deletePurchase(purchase.id).subscribe(() => {
      this.purchases = this.purchases.filter((item) => item.id !== purchase.id);
      if (this.selectedPurchase?.id === purchase.id) {
        this.selectedPurchase = null;
      }
      this.currentPage = Math.min(this.currentPage, this.totalPages);
    });
  }

  savePurchase(): void {
    if (!this.selectedPurchase) {
      return;
    }

    this.cartService.updatePurchase(this.selectedPurchase.id, { status: this.selectedStatus }).subscribe((purchase) => {
      this.purchases = this.purchases.map((item) => (item.id === purchase.id ? purchase : item));
      this.selectedPurchase = purchase;
      this.selectedStatus = purchase.status;
    });
  }

  backToList(): void {
    this.selectedPurchase = null;
  }
}
