import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Product, ProductPayload } from '../../models/product.model';

interface ProductFormDialogData {
  product: Product | null;
  categories: string[];
}

@Component({
  selector: 'app-product-form-dialog',
  templateUrl: './product-form-dialog.component.html',
  styleUrls: ['./product-form-dialog.component.css']
})
export class ProductFormDialogComponent implements OnInit {
  form!: FormGroup;

  selectedFile!: File;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ProductFormDialogData,
    private dialogRef: MatDialogRef<ProductFormDialogComponent>,
    private fb: FormBuilder
  ) {}

  get isEditMode(): boolean {
    return Boolean(this.data.product);
  }

  get categoryOptions(): string[] {
    const currentCategory = this.data.product?.category?.trim();
    const categories = this.data.categories;

    if (currentCategory && !categories.includes(currentCategory)) {
      return [currentCategory, ...categories];
    }

    return categories;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [
        this.data.product?.name ?? '',
        [Validators.required, Validators.minLength(3)]
      ],

      description: [
        this.data.product?.description ?? '',
        [Validators.required, Validators.minLength(10)]
      ],

      price: [
        this.data.product?.price ?? 0,
        [Validators.required, Validators.min(0)]
      ],

      category: [
        this.data.product?.category ?? '',
        [Validators.required]
      ],

      stock: [
        this.data.product?.stock ?? 0,
        [Validators.required, Validators.min(0)]
      ]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    this.selectedFile = input.files[0];
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    const payload: ProductPayload = {
      name: this.form.value.name,
      description: this.form.value.description,
      price: Number(this.form.value.price),
      category: this.form.value.category,
      stock: Number(this.form.value.stock)
    };

    this.dialogRef.close({
      payload,
      file: this.selectedFile
    });
  }
}
