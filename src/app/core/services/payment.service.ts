import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CartService } from './cart.service';
import {
  CreateOrderPayload,
  Order,
  OrderItemPayload,
  PaymentResult,
  PaymentStatus,
} from 'src/app/modules/checkout/models/checkout.model';

const LAST_ORDER_STORAGE_KEY = 'checkout_last_order';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(
    private http: HttpClient,
    private cartService: CartService
  ) {}

  createOrder(payload: CreateOrderPayload): Observable<Order> {
    return this.http.post<unknown>(`${environment.apiUrl}/orders`, payload).pipe(
      map((response) => this.normalizeOrder(response)),
      tap((order) => {
        localStorage.setItem(LAST_ORDER_STORAGE_KEY, order.id);
      })
    );
  }

  createOrderPayment(orderId: string): Observable<PaymentResult> {
    return this.http.post<unknown>(`${environment.apiUrl}/payments/orders/${orderId}`, {}).pipe(
      map((response) => this.normalizePaymentResult(response, orderId)),
      tap(() => {
        this.cartService.clearCart();
      })
    );
  }

  getOrderById(orderId: string | null): Observable<Order | null> {
    if (!orderId) {
      return new Observable<Order | null>((subscriber) => {
        subscriber.next(null);
        subscriber.complete();
      });
    }

    return this.http.get<unknown>(`${environment.apiUrl}/orders/${orderId}`).pipe(
      map((response) => this.normalizeOrder(response))
    );
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<unknown>(`${environment.apiUrl}/orders`).pipe(
      map((response) => {
        const rawOrders = Array.isArray(response)
          ? response
          : this.asArray(this.asRecord(response)['results'] ?? this.asRecord(response)['orders'] ?? response);
        return rawOrders.map((item) => this.normalizeOrder(item));
      })
    );
  }

  getLastOrderId(): string | null {
    return localStorage.getItem(LAST_ORDER_STORAGE_KEY);
  }

  buildOrderItemsPayload(): OrderItemPayload[] {
    return this.cartService.items.map((item) => ({
      productId: item.id,
      quantity: item.quantity
    }));
  }

  private normalizePaymentResult(response: unknown, fallbackOrderId: string): PaymentResult {
    const record = this.asRecord(response);
    const order = this.normalizeOrder(record['order'] ?? {});
    const payment = this.asRecord(record['payment']);
    const redirectUrl = String(payment['initPoint'] ?? payment['sandboxInitPoint'] ?? order.payment.checkoutUrl ?? '').trim();

    return {
      orderId: order.id || fallbackOrderId,
      status: order.payment.status,
      redirectUrl,
      preferenceId: this.optionalString(payment['preferenceId']),
      externalReference: this.optionalString(payment['externalReference'])
    };
  }

  private normalizeOrder(source: unknown): Order {
    const record = this.asRecord(source);
    const paymentRecord = this.asRecord(record['payment']);
    const orderStatus = (this.optionalString(record['status']) ?? 'pending') as Order['status'];
    const paymentStatus = this.normalizePaymentStatus(paymentRecord['status'], orderStatus);

    return {
      id: String(record['id'] ?? record['_id'] ?? ''),
      user: this.optionalString(record['user']),
      status: orderStatus,
      total: Number(record['total'] ?? 0),
      currency: String(record['currency'] ?? 'ARS'),
      address: {
        street: String(this.asRecord(record['address'])['street'] ?? ''),
        city: String(this.asRecord(record['address'])['city'] ?? ''),
        state: this.optionalString(this.asRecord(record['address'])['state']),
        postalCode: this.optionalString(this.asRecord(record['address'])['postalCode']),
        country: String(this.asRecord(record['address'])['country'] ?? ''),
      },
      items: this.asArray(record['items']).map((item) => {
        const itemRecord = this.asRecord(item);
        return {
          productId: String(itemRecord['productId'] ?? ''),
          productName: String(itemRecord['productName'] ?? 'Producto'),
          unitPrice: Number(itemRecord['unitPrice'] ?? 0),
          quantity: Number(itemRecord['quantity'] ?? 0),
          subtotal: Number(itemRecord['subtotal'] ?? 0),
        };
      }),
      payment: {
        provider: String(paymentRecord['provider'] ?? 'mercado_pago'),
        status: paymentStatus,
        preferenceId: this.optionalString(paymentRecord['preferenceId']),
        paymentId: this.optionalString(paymentRecord['paymentId']),
        externalReference: this.optionalString(paymentRecord['externalReference']),
        checkoutUrl: this.optionalString(paymentRecord['checkoutUrl']),
      },
      createdAt: this.optionalString(record['createdAt']),
      updatedAt: this.optionalString(record['updatedAt']),
    };
  }

  private normalizePaymentStatus(value: unknown, orderStatus: string): PaymentStatus {
    const status = String(value ?? '').toLowerCase();

    if (status === 'approved' || orderStatus === 'paid') {
      return 'approved';
    }

    if (status === 'failed' || orderStatus === 'failed') {
      return 'failed';
    }

    if (status === 'cancelled' || orderStatus === 'cancelled') {
      return 'cancelled';
    }

    return 'pending';
  }

  private asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  }

  private asArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }

  private optionalString(value: unknown): string | undefined {
    const normalized = String(value ?? '').trim();
    return normalized || undefined;
  }
}
