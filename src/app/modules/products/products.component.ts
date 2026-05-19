import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { ProductFormDialogComponent } from './components/product-form-dialog/product-form-dialog.component';
import { Product, ProductPayload } from './models/product.model';
import { ProductsService } from './services/products.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

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
  readonly fallbackProductImage = 'assets/images/esueldos-logo-azul.png'; // NUEVO: imagen de respaldo si la miniatura falla o no existe.
  readonly storeBenefits: StoreBenefit[] = [
    { icon: 'local_shipping', title: 'Envíos rápidos', description: 'A todo el país' },
    { icon: 'verified_user', title: 'Garantía oficial', description: 'Productos 100% originales' },
    { icon: 'support_agent', title: 'Soporte técnico', description: 'Asistencia especializada' },
    { icon: 'shield', title: 'Compras seguras', description: 'Métodos de pago protegidos' }
  ];

  constructor(
    private authService: AuthService,
    private themeService: ThemeService, // NUEVO: servicio de tema para alternar modo oscuro/claro.
    private productsService: ProductsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
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

  get isDarkTheme(): boolean {
    return this.themeService.isDarkTheme; // NUEVO: expone estado del tema al template.
  }

  get featuredProducts(): Product[] {
    return this.products.slice(0, 4);
  }

  ngOnInit(): void {
    this.loadProducts();
  }

openCreateDialog(): void {
  if (!this.isAdmin) {
    this.snackBar.open(
      'No tenés permisos para crear productos.',
      'Cerrar',
      { duration: 4000 }
    );

    return;
  }

  const dialogRef = this.dialog.open(
    ProductFormDialogComponent,
    {
      width: '600px',
      data: null
    }
  );

  dialogRef.afterClosed().subscribe((result) => {

    if (!result) {
      return;
    }

    const { payload, file } = result;

    // SI NO hay imagen
    if (!file) {

      this.productsService
        .createProduct(payload)
        .subscribe({
          next: () => {
            this.snackBar.open(
              'Producto creado correctamente.',
              'Cerrar',
              { duration: 3000 }
            );

            this.loadProducts();
          },

          error: (error) =>
            this.showRequestError(
              error,
              'No se pudo crear el producto.'
            )
        });

      return;
    }

    // subir imagen
    const formData = new FormData();

    formData.append('image', file);

    this.http.post<any>(
    `${environment.apiUrl}/v1/upload`,
      formData
    )
    .subscribe({

      next: (uploadResponse) => {

        const productPayload = {
          ...payload,
          imageUrl: uploadResponse.imageUrl
        };

        // crear producto
        this.productsService
          .createProduct(productPayload)
          .subscribe({

            next: () => {

              this.snackBar.open(
                'Producto creado correctamente.',
                'Cerrar',
                { duration: 3000 }
              );

              this.loadProducts();
            },

            error: (error) =>
              this.showRequestError(
                error,
                'No se pudo crear el producto.'
              )
          });
      },

      error: (error) => {
        this.showRequestError(
          error,
          'No se pudo subir la imagen.'
        );
      }
    });
  });
}

  openEditDialog(product: Product): void {
    if (!this.isAdmin) {
      this.snackBar.open('No tenés permisos para editar productos.', 'Cerrar', { duration: 4000 });
      return;
    }

    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '600px',
      data: product
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
      this.snackBar.open('No tenés permisos para eliminar productos.', 'Cerrar', { duration: 4000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Eliminar producto',
        message: `¿Estás seguro que deseás eliminar ${product.name}?`
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

  toggleTheme(): void {
    this.themeService.toggleTheme(); // NUEVO: cambia tema y lo persiste en localStorage.
  }

  trackByProduct(_: number, product: Product): string {
    return product._id;
  }

  getProductStatusLabel(product: Product): string {
    return product.stock > 0 ? 'Disponible' : 'Sin stock'; // NUEVO: etiqueta visible junto al badge de pulso del producto.
  }

getProductImage(product: Product): string {

  if (!product.imageUrl) {
    return this.fallbackProductImage;
  }

  return `${environment.apiUrl}${product.imageUrl}`;
}

  handleProductImageError(event: Event): void {
    const imageElement = event.target as HTMLImageElement;
    imageElement.src = this.fallbackProductImage; // NUEVO: reemplaza imagen rota por una portada segura.
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
      },
      error: (error) => {
        this.products = [];
        this.showRequestError(error, 'No se pudo cargar la lista de productos.');
      }
    });
  }

  private showRequestError(error: any, fallbackMessage: string): void {
    if (error?.status === 403) {
      this.snackBar.open('No tenés permisos para realizar esta acción.', 'Cerrar', { duration: 4500 });
      return;
    }

    const message = error?.error?.message || error?.message || fallbackMessage;
    this.snackBar.open(message, 'Cerrar', { duration: 5000 });
  }
}
