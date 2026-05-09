import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from 'src/app/modules/products/models/product.model';

const FAVORITES_STORAGE_KEY = 'favorite_products';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly favoritesSubject = new BehaviorSubject<Product[]>(this.loadFavorites());
  readonly favorites$ = this.favoritesSubject.asObservable();

  get items(): Product[] {
    return this.favoritesSubject.value;
  }

  isFavorite(productId: string): boolean {
    return this.items.some((item) => item.id === productId);
  }

  toggleFavorite(product: Product): boolean {
    if (this.isFavorite(product.id)) {
      this.persist(this.items.filter((item) => item.id !== product.id));
      return false;
    }

    this.persist([product, ...this.items]);
    return true;
  }

  private loadFavorites(): Product[] {
    const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);

    if (!savedFavorites) {
      return [];
    }

    try {
      const parsedFavorites = JSON.parse(savedFavorites) as Product[];
      return Array.isArray(parsedFavorites) ? parsedFavorites : [];
    } catch {
      return [];
    }
  }

  private persist(items: Product[]): void {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items));
    this.favoritesSubject.next(items);
  }
}
