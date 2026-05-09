import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from 'src/app/modules/products/models/product.model';
import { CartItem, CartSummary } from 'src/app/modules/cart/models/cart-item.model';

const CART_STORAGE_KEY = 'shopping_cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly cartSubject = new BehaviorSubject<CartItem[]>(this.loadCart());
  readonly cart$ = this.cartSubject.asObservable();

  get items(): CartItem[] {
    return this.cartSubject.value;
  }

  get summary(): CartSummary {
    return this.buildSummary(this.items);
  }

  addProduct(product: Product, quantity = 1): void {
    if (product.stock <= 0 || quantity <= 0) {
      return;
    }

    const currentItems = [...this.items];
    const existingItem = currentItems.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity = Math.min(existingItem.quantity + quantity, product.stock);
      existingItem.subtotal = existingItem.quantity * existingItem.price;
      this.persist(currentItems);
      return;
    }

    currentItems.push({
      ...product,
      quantity: Math.min(quantity, product.stock),
      subtotal: product.price * Math.min(quantity, product.stock)
    });

    this.persist(currentItems);
  }

  updateQuantity(productId: string, quantity: number): void {
    const nextItems = this.items
      .map((item) => {
        if (item.id !== productId) {
          return item;
        }

        const nextQuantity = Math.max(1, Math.min(quantity, item.stock));
        return {
          ...item,
          quantity: nextQuantity,
          subtotal: nextQuantity * item.price
        };
      });

    this.persist(nextItems);
  }

  removeProduct(productId: string): void {
    this.persist(this.items.filter((item) => item.id !== productId));
  }

  clearCart(): void {
    this.persist([]);
  }

  private buildSummary(items: CartItem[]): CartSummary {
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);

    return {
      items,
      totalItems,
      subtotal,
      total: subtotal
    };
  }

  private loadCart(): CartItem[] {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!savedCart) {
      return [];
    }

    try {
      const parsedItems = JSON.parse(savedCart) as CartItem[];
      return Array.isArray(parsedItems)
        ? parsedItems.map((item) => ({
          ...item,
          quantity: Number(item.quantity ?? 1),
          subtotal: Number(item.subtotal ?? Number(item.price ?? 0) * Number(item.quantity ?? 1))
        }))
        : [];
    } catch {
      return [];
    }
  }

  private persist(items: CartItem[]): void {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    this.cartSubject.next(items);
  }
}
