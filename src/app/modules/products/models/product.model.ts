export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string; // NUEVO: URL opcional de miniatura para mostrar una portada en cada card.
}

export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string; // NUEVO: permite persistir la imagen del producto desde el formulario.
}
