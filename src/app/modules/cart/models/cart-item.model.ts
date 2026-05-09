import { Product } from '../../products/models/product.model';

export interface CartItem extends Product {
  quantity: number;
  subtotal: number;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  total: number;
}
