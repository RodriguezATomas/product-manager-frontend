export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
}

export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
}
