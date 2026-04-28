import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Product, ProductPayload } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<unknown>(`${environment.apiUrl}/products`).pipe(
      map((response) => this.normalizeProductsResponse(response))
    );
  }

  createProduct(payload: ProductPayload): Observable<Product> {
    return this.http.post<unknown>(`${environment.apiUrl}/products`, payload).pipe(
      map((response) => this.normalizeProduct(this.extractEntity(response)))
    );
  }

  updateProduct(productId: string, payload: ProductPayload): Observable<Product> {
    return this.http.patch<unknown>(`${environment.apiUrl}/products/${productId}`, payload).pipe(
      map((response) => this.normalizeProduct(this.extractEntity(response)))
    );
  }

  deleteProduct(productId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/products/${productId}`);
  }

  private normalizeProductsResponse(response: unknown): Product[] {
    if (Array.isArray(response)) {
      return response.map((item) => this.normalizeProduct(item));
    }

    const data = this.extractEntity(response) as Record<string, unknown>;
    const rawItems = this.asArray(data['results'] ?? data['items'] ?? data['products'] ?? data['data'] ?? []);
    return rawItems.map((item) => this.normalizeProduct(item));
  }

  private normalizeProduct(source: any): Product {
    return {
      id: String(source?.id ?? source?._id ?? ''),
      name: String(source?.name ?? 'Sin nombre'),
      description: String(source?.description ?? ''),
      price: Number(source?.price ?? 0),
      category: String(source?.category ?? 'Sin categoría'),
      stock: Number(source?.stock ?? 0),
      imageUrl: this.normalizeImageUrl(source?.imageUrl ?? source?.thumbnail ?? source?.photoUrl) // NUEVO: soporta varias claves de imagen al normalizar la respuesta.
    };
  }

  private extractEntity(response: unknown): unknown {
    if (!response || typeof response !== 'object') {
      return response;
    }

    const record = response as Record<string, unknown>;
    return record['product'] ?? record['data'] ?? record['result'] ?? response;
  }

  private asArray(value: unknown): any[] {
    return Array.isArray(value) ? value : [];
  }

  private normalizeImageUrl(value: unknown): string | undefined {
    const normalizedValue = String(value ?? '').trim();
    return normalizedValue || undefined;
  }
}
