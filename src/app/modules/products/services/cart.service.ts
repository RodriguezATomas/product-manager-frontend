import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: CartItem[] = [];

  getItems(): CartItem[] {
    return this.items.map((item) => ({
      product: item.product,
      quantity: item.quantity
    }));
  }

  getItemsCount(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  addProduct(product: Product): 'added' | 'out_of_stock' | 'max_stock' {
    if (product.stock <= 0) {
      return 'out_of_stock';
    }

    const existingItem = this.items.find((item) => item.product._id === product._id);

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        return 'max_stock';
      }

      existingItem.quantity += 1;
      return 'added';
    }

    this.items.push({ product, quantity: 1 });
    return 'added';
  }

  updateQuantity(productId: string, quantity: number): void {
    const item = this.items.find((cartItem) => cartItem.product._id === productId);

    if (!item) {
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      item.quantity = 1;
      return;
    }

    item.quantity = Math.min(quantity, item.product.stock);
  }

  removeProduct(productId: string): void {
    this.items = this.items.filter((item) => item.product._id !== productId);
  }

  getSubtotal(): number {
    return this.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }
}
