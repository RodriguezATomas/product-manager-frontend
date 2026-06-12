import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Product } from '../models/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Purchase {
  id: string;
  user: string;
  date: string;
  status: string;
  paymentMethod: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: CartItem[] = [];

  constructor(private http: HttpClient) {}

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

  completePurchase(user: string, paymentMethod: string, shippingCost: number): Observable<Purchase> | null {
    if (!this.items.length || paymentMethod !== 'cash') {
      return null;
    }

    return this.http.post<unknown>(`${environment.apiUrl}/v1/orders/checkout`, {
      paymentMethod: 'cash',
      shippingCost,
      items: this.items.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity
      }))
    }).pipe(
      map((response) => this.normalizePurchase(response, user)),
      tap((purchase) => {
        purchase.items.forEach((item) => {
          const cartItem = this.items.find((currentItem) => currentItem.product._id === item.product._id);
          if (cartItem) {
            cartItem.product.stock = Math.max(cartItem.product.stock - cartItem.quantity, 0);
          }
        });
        this.items = [];
      })
    );
  }

  getPurchases(user: string): Observable<Purchase[]> {
    return this.http.get<unknown>(`${environment.apiUrl}/v1/orders`).pipe(
      map((response) => this.normalizePurchasesResponse(response, user))
    );
  }

  deletePurchase(purchaseId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/v1/orders/${purchaseId}`);
  }

  updatePurchase(purchaseId: string, payload: Partial<Pick<Purchase, 'status'>>): Observable<Purchase> {
    return this.http.patch<unknown>(`${environment.apiUrl}/v1/orders/${purchaseId}`, payload).pipe(
      map((response) => this.normalizePurchase(response, 'Admin'))
    );
  }

  private normalizePurchasesResponse(response: unknown, user: string): Purchase[] {
    const data = this.extractEntity(response) as Record<string, unknown>;
    const rawItems = Array.isArray(response)
      ? response
      : this.asArray(data['results'] ?? data['items'] ?? data['orders'] ?? data['data'] ?? []);
    return rawItems.map((item) => this.normalizePurchase(item, user));
  }

  private normalizePurchase(source: any, user: string): Purchase {
    const rawItems = this.asArray(source?.items);
    return {
      id: String(source?.id ?? source?._id ?? ''),
      user: this.normalizeUser(source?.user, user),
      date: this.formatDate(source?.createdAt),
      status: String(source?.status ?? 'confirmed'),
      paymentMethod: source?.paymentMethod === 'cash' ? 'Efectivo' : String(source?.paymentMethod ?? ''),
      items: rawItems.map((item) => this.normalizePurchaseItem(item)),
      subtotal: Number(source?.subtotal ?? 0),
      shippingCost: Number(source?.shippingCost ?? 0),
      total: Number(source?.total ?? 0)
    };
  }

  private normalizePurchaseItem(source: any): CartItem {
    return {
      product: {
        _id: String(source?.product ?? source?.productId ?? ''),
        name: String(source?.name ?? 'Producto'),
        description: '',
        price: Number(source?.price ?? 0),
        category: '',
        stock: 0
      },
      quantity: Number(source?.quantity ?? 0)
    };
  }

  private normalizeUser(source: any, fallback: string): string {
    if (source && typeof source === 'object') {
      return String(source.name ?? source.email ?? fallback);
    }

    return fallback;
  }

  private extractEntity(response: unknown): unknown {
    if (!response || typeof response !== 'object') {
      return response;
    }

    const record = response as Record<string, unknown>;
    return record['order'] ?? record['data'] ?? record['result'] ?? response;
  }

  private asArray(value: unknown): any[] {
    return Array.isArray(value) ? value : [];
  }

  private formatDate(value: unknown): string {
    const date = value ? new Date(String(value)) : new Date();
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('es-AR');
  }
}
