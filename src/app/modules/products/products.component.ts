import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { environment } from 'src/environments/environment';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { ProductFormDialogComponent } from './components/product-form-dialog/product-form-dialog.component';
import { ProductCategory } from './models/product-category.model';
import { Product, ProductPayload } from './models/product.model';
import { CartService } from './services/cart.service';
import { ProductCategoriesService } from './services/product-categories.service';
import { ProductsService } from './services/products.service';

interface StoreBenefit {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  storeHome = false;
  storeFavorites = false;
  selectedStoreCategory = '';
  favoriteProductIds: string[] = [];
  pageIndex = 0;
  storePageIndex = 0;
  readonly pageSize = 12;
  readonly fallbackProductImage = 'assets/images/esueldos-logo-azul.png';
  private readonly favoritesStorageKey = 'favoriteProductIds';
  storeCategories: ProductCategory[] = [];
  readonly storeBenefits: StoreBenefit[] = [
    { icon: 'local_shipping', title: 'Envios rapidos', description: 'A todo el pais' },
    { icon: 'verified_user', title: 'Garantia oficial', description: 'Productos 100% originales' },
    { icon: 'support_agent', title: 'Soporte tecnico', description: 'Asistencia especializada' },
    { icon: 'shield', title: 'Compras seguras', description: 'Metodos de pago protegidos' }
  ];

  constructor(
    private authService: AuthService,
    private productsService: ProductsService,
    private productCategoriesService: ProductCategoriesService,
    private cartService: CartService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get currentUserName(): string {
    return this.authService.currentUserData?.name || 'Usuario';
  }

  get currentUserRoleLabel(): string {
    return this.isAdmin ? 'Administrador' : 'Usuario';
  }

  get featuredProducts(): Product[] {
    return this.products.slice(0, 4);
  }

  get pagedProducts(): Product[] {
    const startIndex = this.pageIndex * this.pageSize;
    return this.products.slice(startIndex, startIndex + this.pageSize);
  }

  get visibleStoreProducts(): Product[] {
    const products = this.storeFavorites
      ? this.products.filter((product) => this.isFavorite(product))
      : this.storeHome ? this.featuredProducts : this.products;

    if (!this.selectedStoreCategory) {
      return products;
    }

    return products.filter((product) => product.category.toLowerCase() === this.selectedStoreCategory.toLowerCase());
  }

  get pagedVisibleStoreProducts(): Product[] {
    const startIndex = this.storePageIndex * this.pageSize;
    return this.visibleStoreProducts.slice(startIndex, startIndex + this.pageSize);
  }

  get categoryNames(): string[] {
    return this.storeCategories.map((category) => category.name);
  }

  get cartItemsCount(): number {
    return this.cartService.getItemsCount();
  }

  ngOnInit(): void {
    this.storeHome = Boolean(this.route.snapshot.data['storeHome']);
    this.storeFavorites = Boolean(this.route.snapshot.data['storeFavorites']);
    this.favoriteProductIds = JSON.parse(localStorage.getItem(this.favoritesStorageKey) || '[]');
    this.loadCategories();
    this.loadProducts();
  }

  openCreateDialog(): void {
    if (!this.isAdmin) {
      this.snackBar.open('No tenes permisos para crear productos.', 'Cerrar', { duration: 4000 });
      return;
    }

    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '600px',
      data: {
        product: null,
        categories: this.categoryNames
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      const { payload, file } = result;

      if (!file) {
        this.productsService.createProduct(payload).subscribe({
          next: () => {
            this.snackBar.open('Producto creado correctamente.', 'Cerrar', { duration: 3000 });
            this.loadProducts();
          },
          error: (error) => this.showRequestError(error, 'No se pudo crear el producto.')
        });

        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      this.http.post<any>(`${environment.apiUrl}/v1/upload`, formData).subscribe({
        next: (uploadResponse) => {
          const productPayload = {
            ...payload,
            imageUrl: uploadResponse.imageUrl
          };

          this.productsService.createProduct(productPayload).subscribe({
            next: () => {
              this.snackBar.open('Producto creado correctamente.', 'Cerrar', { duration: 3000 });
              this.loadProducts();
            },
            error: (error) => this.showRequestError(error, 'No se pudo crear el producto.')
          });
        },
        error: (error) => {
          this.showRequestError(error, 'No se pudo subir la imagen.');
        }
      });
    });
  }

  openEditDialog(product: Product): void {
    if (!this.isAdmin) {
      this.snackBar.open('No tenes permisos para editar productos.', 'Cerrar', { duration: 4000 });
      return;
    }

    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '600px',
      data: {
        product,
        categories: this.categoryNames
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      const { payload } = result;

      this.productsService.updateProduct(product._id, payload).subscribe({
        next: () => {
          this.snackBar.open('Producto actualizado correctamente.', 'Cerrar', { duration: 3000 });
          this.loadProducts();
        },
        error: (error) => this.showRequestError(error, 'No se pudo actualizar el producto.')
      });
    });
  }

  confirmDelete(product: Product): void {
    if (!this.isAdmin) {
      this.snackBar.open('No tenes permisos para eliminar productos.', 'Cerrar', { duration: 4000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Eliminar producto',
        message: `Estas seguro que deseas eliminar ${product.name}?`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }

      this.productsService.deleteProduct(product._id).subscribe({
        next: () => {
          this.snackBar.open('Producto eliminado correctamente.', 'Cerrar', { duration: 3000 });
          this.loadProducts();
        },
        error: (error) => this.showRequestError(error, 'No se pudo eliminar el producto.')
      });
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  trackByProduct(_: number, product: Product): string {
    return product._id;
  }

  getProductStatusLabel(product: Product): string {
    return product.stock > 0 ? 'Disponible' : 'Sin stock';
  }

  getProductImage(product: Product): string {
    if (!product.imageUrl) {
      return this.fallbackProductImage;
    }

    return `${environment.apiUrl}${product.imageUrl}`;
  }

  handleProductImageError(event: Event): void {
    const imageElement = event.target as HTMLImageElement;
    imageElement.src = this.fallbackProductImage;
  }

  openCartPage(): void {
    this.router.navigate(['/products/cart']);
  }

  changePage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
  }

  changeStorePage(event: PageEvent): void {
    this.storePageIndex = event.pageIndex;
  }

  selectStoreCategory(category: string): void {
    this.selectedStoreCategory = category;
    this.storePageIndex = 0;
  }

  addToCart(product: Product): void {
    const result = this.cartService.addProduct(product);

    if (result === 'out_of_stock') {
      this.snackBar.open('No hay stock disponible para este producto.', 'Cerrar', { duration: 3000 });
      return;
    }

    if (result === 'max_stock') {
      this.snackBar.open('No podes agregar mas unidades que el stock disponible.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.snackBar.open('Producto agregado al carrito.', 'Cerrar', { duration: 2500 });
  }

  isFavorite(product: Product): boolean {
    return this.favoriteProductIds.includes(product._id);
  }

  toggleFavorite(product: Product): void {
    this.favoriteProductIds = this.isFavorite(product)
      ? this.favoriteProductIds.filter((productId) => productId !== product._id)
      : [...this.favoriteProductIds, product._id];
    localStorage.setItem(this.favoritesStorageKey, JSON.stringify(this.favoriteProductIds));
  }

  private loadProducts(): void {
    this.loading = true;
    this.productsService.getProducts().pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (products) => {
        this.products = products;
        this.pageIndex = 0;
        this.storePageIndex = 0;
      },
      error: (error) => {
        this.products = [];
        this.showRequestError(error, 'No se pudo cargar la lista de productos.');
      }
    });
  }

  private loadCategories(): void {
    this.productCategoriesService.getCategories().subscribe({
      next: (categories) => {
        this.storeCategories = categories;
      },
      error: (error) => this.showRequestError(error, 'No se pudo cargar la lista de categorias.')
    });
  }

  private showRequestError(error: any, fallbackMessage: string): void {
    if (error?.status === 403) {
      this.snackBar.open('No tenes permisos para realizar esta accion.', 'Cerrar', { duration: 4500 });
      return;
    }

    const message = error?.error?.message || error?.message || fallbackMessage;
    this.snackBar.open(message, 'Cerrar', { duration: 5000 });
  }
}
