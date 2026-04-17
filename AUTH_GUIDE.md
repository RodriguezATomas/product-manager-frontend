# 🔐 Autenticación - Guía Completa

## Estructura Implementada

### Componentes
- **LoginComponent**: Formulario de inicio de sesión con validaciones reactivas
- **SignupComponent**: Formulario de registro con validador personalizado para confirmar contraseñas

### Validador Personalizado
- **passwordMatchValidator**: Validador a nivel de FormGroup que confirma que las contraseñas coincidan

## Funcionalidades Principales

### 1. Formularios Reactivos
- ✅ Validación en tiempo real
- ✅ Mensajes de error contextualizados
- ✅ Estados visuales (enfoque, error, deshabilitado)

### 2. Custom Validator - Password Match
```typescript
// En signup.component.ts
this.signupForm = this.fb.group(
  {
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  },
  { validators: passwordMatchValidator('password', 'confirmPassword') }
);
```

**Características:**
- Valida que ambas contraseñas coincidan
- Muestra el error solo en el campo de confirmación
- Indica visualmente si las contraseñas coinciden ✓

### 3. MatSnackBar para Errores de API
```typescript
// Errores simples
this.snackBar.open(errorMessage, 'Cerrar', { 
  duration: 5000, 
  panelClass: ['error-snackbar'] 
});

// Errores múltiples del servidor
if (err.error?.errors) {
  Object.values(err.error.errors).forEach((msg: any) => {
    this.snackBar.open(msg, 'Cerrar', { 
      duration: 5000, 
      panelClass: ['error-snackbar'] 
    });
  });
}
```

**Ejemplos de errores que se pueden mostrar:**
- "Email ya registrado"
- "Usuario o contraseña incorrectos"
- "El email ya está en uso"

### 4. Validaciones Visuales

#### Login
- Email inválido
- Contraseña mínimo 6 caracteres
- Botón de mostrar/ocultar contraseña
- Spinner de carga durante la autenticación

#### Signup
- Nombre mínimo 3 caracteres
- Email válido
- Contraseña mínimo 8 caracteres
- Confirmación de contraseña con indicador visual (✓/✗)
- Spinner de carga durante el registro

## Rutas Disponibles

```
/auth/login          → Formulario de inicio de sesión
/auth/signup         → Formulario de registro
/auth                → Redirige a /auth/login por defecto
```

## API Esperada

### POST /auth/login
```json
Request:
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}

Response:
{
  "token": "jwt_token_aqui",
  "user": { ... }
}

Error:
{
  "message": "Usuario o contraseña incorrectos"
}
```

### POST /auth/register
```json
Request:
{
  "name": "Juan Pérez",
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}

Response:
{
  "token": "jwt_token_aqui",
  "user": { ... }
}

Error (validaciones):
{
  "message": "Email ya registrado",
  // O para errores múltiples:
  "errors": {
    "email": "Email ya está en uso",
    "password": "La contraseña es muy débil"
  }
}
```

## Estilos y Temas

### Gradiente
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Colores
- Primario: #667eea
- Secundario: #764ba2
- Error: #f44336
- Éxito: #4caf50

## Cómo Personalizar

### Cambiar colores
Editar en `login.component.css` y `signup.component.css`:
```css
.login-container {
  background: linear-gradient(135deg, TU_COLOR_1 0%, TU_COLOR_2 100%);
}
```

### Agregar más validaciones
En `login.component.ts` o `signup.component.ts`:
```typescript
this.signupForm = this.fb.group({
  email: ['', [Validators.required, Validators.email, customValidator]],
  // ... más campos
});
```

### Cambiar duración del Snackbar
```typescript
this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 }); // 5000ms = 5 segundos
```

## Testing

Se proporcionan archivos `.spec.ts` para escribir pruebas unitarias:
- `login.component.spec.ts`
- `signup.component.spec.ts`

Ejemplo de test para el validador:
```typescript
it('should validate password match', () => {
  const form = new FormGroup({
    password: new FormControl('password123'),
    confirmPassword: new FormControl('password123')
  }, passwordMatchValidator('password', 'confirmPassword'));
  
  expect(form.valid).toBeTruthy();
});
```

## Problemas Comunes

### 1. MatSnackBar no funciona
- Asegúrate de que `BrowserAnimationsModule` esté importado en `app.module.ts`
- Verifica que `MatSnackBarModule` esté importado

### 2. Validador personalizado no funciona
- Asegúrate de importar `passwordMatchValidator` en el componente
- Verifica que esté en el segundo parámetro de `fb.group()`

### 3. Los íconos no aparecen
- Importa `MatIconModule` en el módulo correspondiente
- Verifica que `@angular/material/icon` esté instalado

## Archivos Creados/Modificados

### Nuevos:
- `src/app/shared/validators/password-match.validator.ts`
- `src/app/modules/auth/components/signup/signup.component.ts`
- `src/app/modules/auth/components/signup/signup.component.html`
- `src/app/modules/auth/components/signup/signup.component.css`
- `src/app/modules/auth/components/signup/signup.component.spec.ts`

### Modificados:
- `src/app/modules/auth/auth.module.ts` (agregados imports de Material)
- `src/app/modules/auth/auth.component.ts` (simplificado)
- `src/app/modules/auth/auth.component.html` (actualizado a contenedor con router-outlet)
- `src/app/modules/auth/auth-routing.module.ts` (agregadas rutas para login/signup)
- `src/app/modules/auth/components/login/login.component.ts` (mejorado)
- `src/app/modules/auth/components/login/login.component.html` (UI mejorada)
- `src/app/modules/auth/components/login/login.component.css` (estilos agregados)
- `src/app/core/services/auth.service.ts` (agregado método register)
- `src/app/app.module.ts` (agregado MatIconModule)
