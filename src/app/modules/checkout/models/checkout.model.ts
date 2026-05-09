export type PaymentMethod = 'mercado-pago';
export type PaymentStatus = 'approved' | 'pending' | 'failed' | 'cancelled';
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled';

export interface CheckoutFormValue {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  paymentMethod: PaymentMethod;
}

export interface OrderItemPayload {
  productId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  items: OrderItemPayload[];
  currency: string;
  address: {
    street: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
}

export interface Order {
  id: string;
  user?: string;
  status: OrderStatus;
  total: number;
  currency: string;
  address: {
    street: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }>;
  payment: {
    provider: string;
    status: PaymentStatus;
    preferenceId?: string;
    paymentId?: string;
    externalReference?: string;
    checkoutUrl?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentResult {
  orderId: string;
  status: PaymentStatus;
  redirectUrl: string;
  preferenceId?: string;
  externalReference?: string;
}
