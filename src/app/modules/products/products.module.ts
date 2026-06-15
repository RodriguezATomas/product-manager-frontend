import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { ProductsRoutingModule } from './products-routing.module';
import { CartPageComponent } from './components/cart-page/cart-page.component';
import { ProductsComponent } from './products.component';
import { ProductFormDialogComponent } from './components/product-form-dialog/product-form-dialog.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { OrdersPageComponent } from './components/orders-page/orders-page.component';
import { CategoriesPageComponent } from './components/categories-page/categories-page.component';

export function getPaginatorIntl(): MatPaginatorIntl {
  const paginatorIntl = new MatPaginatorIntl();

  paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }

    const startIndex = page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, length);
    return `${startIndex + 1} – ${endIndex} de ${length}`;
  };

  return paginatorIntl;
}

@NgModule({
  declarations: [
    ProductsComponent,
    CartPageComponent,
    OrdersPageComponent,
    CategoriesPageComponent,
    ProductFormDialogComponent,
    ConfirmDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    ProductsRoutingModule
  ],
  providers: [
    { provide: MatPaginatorIntl, useFactory: getPaginatorIntl }
  ]
})
export class ProductsModule { }
