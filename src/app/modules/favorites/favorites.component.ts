import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { CartService } from 'src/app/core/services/cart.service';
import { FavoritesService } from 'src/app/core/services/favorites.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { Product } from '../products/models/product.model';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  favorites: Product[] = [];

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private themeService: ThemeService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get currentUserName(): string {
    return this.authService.currentUserData?.name || 'Usuario';
  }

  get currentUserRoleLabel(): string {
    return this.isAdmin ? 'Administrador' : 'Cliente';
  }

  get isDarkTheme(): boolean {
    return this.themeService.isDarkTheme;
  }

  ngOnInit(): void {
    if (this.isAdmin) {
      this.router.navigate(['/orders']);
      return;
    }

    this.favorites = this.favoritesService.items;
    this.favoritesService.favorites$.subscribe((items) => {
      this.favorites = items;
    });
  }

  addToCart(product: Product): void {
    if (product.stock <= 0) {
      this.snackBar.open('Este producto no tiene stock disponible.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.cartService.addProduct(product);
    this.snackBar.open(`${product.name} se agregó al carrito.`, 'Cerrar', { duration: 2800 });
  }

  removeFavorite(product: Product): void {
    this.favoritesService.toggleFavorite(product);
    this.snackBar.open(`${product.name} salió de favoritos.`, 'Cerrar', { duration: 2600 });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
