import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { passwordMatchValidator } from '../../../../shared/validators/password-match.validator';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.signupForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: passwordMatchValidator('password', 'confirmPassword') }
    );
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      return;
    }

    this.loading = true;
    const { name, email, password } = this.signupForm.value;

    this.authService.register({ email, password, name }).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('¡Registro exitoso! Bienvenido', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        const errorMessage = err.error?.message || 'Error al registrarse';

        if (err.error?.errors) {
          Object.values(err.error.errors).forEach((msg: any) => {
            this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
          });
        } else {
          this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
        }
      }
    });
  }

}
