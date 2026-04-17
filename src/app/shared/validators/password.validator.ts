import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador personalizado para confirmar que dos campos de contraseña coincidan
 * @param passwordFieldName - Nombre del campo de contraseña principal (ej: 'password')
 * @param confirmPasswordFieldName - Nombre del campo de confirmación (ej: 'confirmPassword')
 * @returns ValidatorFn o null
 */
export function passwordMatchValidator(
  passwordFieldName: string,
  confirmPasswordFieldName: string
): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const passwordControl = formGroup.get(passwordFieldName);
    const confirmPasswordControl = formGroup.get(confirmPasswordFieldName);

    if (!passwordControl || !confirmPasswordControl) {
      return null;
    }

    if (confirmPasswordControl.errors && !confirmPasswordControl.errors['passwordMismatch']) {
      return null;
    }

    if (passwordControl.value !== confirmPasswordControl.value) {
      confirmPasswordControl.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      confirmPasswordControl.setErrors(null);
      return null;
    }
  };
}
