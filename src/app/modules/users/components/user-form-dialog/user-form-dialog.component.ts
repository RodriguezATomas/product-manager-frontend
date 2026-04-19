import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User, UserPayload } from '../../models/user.model';

@Component({
  selector: 'app-user-form-dialog',
  templateUrl: './user-form-dialog.component.html',
  styleUrls: ['./user-form-dialog.component.css']
})
export class UserFormDialogComponent implements OnInit {
  form!: FormGroup;
  hidePassword = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: User | null,
    private dialogRef: MatDialogRef<UserFormDialogComponent>,
    private fb: FormBuilder
  ) {}

  get isEditMode(): boolean {
    return Boolean(this.data);
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.data?.name ?? '', [Validators.required, Validators.minLength(3)]],
      email: [this.data?.email ?? '', [Validators.required, Validators.email]],
      role: [this.data?.role ?? 'user', [Validators.required]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(8)]]
    });
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    const payload: UserPayload = {
      name: this.form.value.name,
      email: this.form.value.email,
      role: this.form.value.role
    };

    if (this.form.value.password) {
      payload.password = this.form.value.password;
    }

    this.dialogRef.close(payload);
  }
}
