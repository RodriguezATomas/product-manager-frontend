import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ProductCategory } from '../models/product-category.model';

@Injectable({
  providedIn: 'root'
})
export class ProductCategoriesService {
  constructor(private http: HttpClient) {}

  getCategories(): Observable<ProductCategory[]> {
    return this.http.get<unknown>(`${environment.apiUrl}/v1/product-categories`).pipe(
      map((response) => this.asArray(response).map((category) => this.normalizeCategory(category)))
    );
  }

  createCategory(name: string): Observable<ProductCategory> {
    return this.http.post<unknown>(`${environment.apiUrl}/v1/product-categories`, { name }).pipe(
      map((response) => this.normalizeCategory(response))
    );
  }

  updateCategory(categoryId: string, name: string): Observable<ProductCategory> {
    return this.http.patch<unknown>(`${environment.apiUrl}/v1/product-categories/${categoryId}`, { name }).pipe(
      map((response) => this.normalizeCategory(response))
    );
  }

  deleteCategory(categoryId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/v1/product-categories/${categoryId}`);
  }

  private normalizeCategory(source: any): ProductCategory {
    return {
      id: String(source?.id ?? source?._id ?? ''),
      name: String(source?.name ?? '')
    };
  }

  private asArray(value: unknown): any[] {
    return Array.isArray(value) ? value : [];
  }
}
