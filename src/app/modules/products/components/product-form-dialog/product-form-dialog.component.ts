import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Product, ProductPayload } from '../../models/product.model';

@Component({
  selector: 'app-product-form-dialog',
  templateUrl: './product-form-dialog.component.html',
  styleUrls: ['./product-form-dialog.component.css']
})
export class ProductFormDialogComponent implements OnInit {
  form!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Product | null,
    private dialogRef: MatDialogRef<ProductFormDialogComponent>,
    private fb: FormBuilder
  ) {}

  get isEditMode(): boolean {
    return Boolean(this.data);
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.data?.name ?? '', [Validators.required, Validators.minLength(3)]],
      description: [this.data?.description ?? '', [Validators.required, Validators.minLength(10)]],
      price: [this.data?.price ?? 0, [Validators.required, Validators.min(0)]],
      category: [this.data?.category ?? '', [Validators.required]],
      stock: [this.data?.stock ?? 0, [Validators.required, Validators.min(0)]]
    });
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

    this.dialogRef.close(payload);
  }
}
