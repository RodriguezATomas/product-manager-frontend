import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { ProductFormDialogComponent } from './components/product-form-dialog/product-form-dialog.component';
import { Product, ProductPayload } from './models/product.model';
import { ProductsService } from './services/products.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;

  constructor(
    private authService: AuthService,
    private productsService: ProductsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  openCreateDialog(): void {
    if (!this.isAdmin) {
      this.snackBar.open('No tenés permisos para crear productos.', 'Cerrar', { duration: 4000 });
      return;
    }

    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '600px',
      data: null
    });

    dialogRef.afterClosed().subscribe((payload?: ProductPayload) => {
      if (!payload) {
        return;
      }

      this.productsService.createProduct(payload).subscribe({
        next: () => {
          this.snackBar.open('Producto creado correctamente.', 'Cerrar', { duration: 3000 });
          this.loadProducts();
        },
        error: (error) => this.showRequestError(error, 'No se pudo crear el producto.')
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

    dialogRef.afterClosed().subscribe((payload?: ProductPayload) => {
      if (!payload) {
        return;
      }

      this.productsService.updateProduct(product.id, payload).subscribe({
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

      this.productsService.deleteProduct(product.id).subscribe({
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
    return product.id;
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
