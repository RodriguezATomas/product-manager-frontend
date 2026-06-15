import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductCategory } from '../../models/product-category.model';
import { ProductCategoriesService } from '../../services/product-categories.service';

@Component({
  selector: 'app-categories-page',
  templateUrl: './categories-page.component.html',
  styleUrls: ['./categories-page.component.css']
})
export class CategoriesPageComponent implements OnInit {
  categories: ProductCategory[] = [];
  categoryName = '';
  editingCategoryId = '';

  constructor(
    private productCategoriesService: ProductCategoriesService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  saveCategory(): void {
    const name = this.categoryName.trim();

    if (!name) {
      return;
    }

    if (this.editingCategoryId) {
      this.productCategoriesService.updateCategory(this.editingCategoryId, name).subscribe({
        next: () => {
          this.resetForm();
          this.loadCategories();
        },
        error: (error) => this.showRequestError(error, 'No se pudo actualizar la categoria.')
      });
      return;
    }

    this.productCategoriesService.createCategory(name).subscribe({
      next: () => {
        this.resetForm();
        this.loadCategories();
      },
      error: (error) => this.showRequestError(error, 'No se pudo crear la categoria.')
    });
  }

  editCategory(category: ProductCategory): void {
    this.editingCategoryId = category.id;
    this.categoryName = category.name;
  }

  deleteCategory(category: ProductCategory): void {
    this.productCategoriesService.deleteCategory(category.id).subscribe({
      next: () => this.loadCategories(),
      error: (error) => this.showRequestError(error, 'No se pudo eliminar la categoria.')
    });
  }

  resetForm(): void {
    this.categoryName = '';
    this.editingCategoryId = '';
  }

  private loadCategories(): void {
    this.productCategoriesService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => this.showRequestError(error, 'No se pudo cargar la lista de categorias.')
    });
  }

  private showRequestError(error: any, fallbackMessage: string): void {
    const message = error?.error?.message || error?.message || fallbackMessage;
    this.snackBar.open(message, 'Cerrar', { duration: 5000 });
  }
}
