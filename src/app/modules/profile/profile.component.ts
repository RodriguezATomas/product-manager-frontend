import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { UsersService } from '../users/services/users.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  loading = false;
  savingProfile = false;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.loadProfile();
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.savingProfile = true;
    this.usersService.updateProfile(this.profileForm.getRawValue()).pipe(
      finalize(() => {
        this.savingProfile = false;
      })
    ).subscribe({
      next: () => {
        this.snackBar.open('Perfil actualizado correctamente.', 'Cerrar', { duration: 3000 });
      },
      error: (error) => this.showRequestError(error, 'No se pudo actualizar el perfil.')
    });
  }

  private loadProfile(): void {
    this.loading = true;
    this.usersService.getProfile().pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (user) => {
        this.profileForm.patchValue({
          name: user.name,
          email: user.email
        });
      },
      error: (error) => this.showRequestError(error, 'No se pudo cargar el perfil.')
    });
  }

  private showRequestError(error: any, fallbackMessage: string): void {
    const message = error?.error?.message || error?.message || fallbackMessage;
    this.snackBar.open(message, 'Cerrar', { duration: 5000 });
  }
}
