import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard'; // 1. Importa tu guard

const routes: Routes = [
  { 
    path: 'auth', 
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule) 
  },
  { 
    path: 'users', 
    canActivate: [AuthGuard], // 2. Protegido
    loadChildren: () => import('./modules/users/users.module').then(m => m.UsersModule) 
  },
  { 
    path: 'products', 
    canActivate: [AuthGuard], // 2. Protegido
    loadChildren: () => import('./modules/products/products.module').then(m => m.ProductsModule) 
  },
  { path: '', redirectTo: 'auth', pathMatch: 'full' } // Redirección por defecto
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';

// const routes: Routes = [{ path: 'auth', loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule) }, { path: 'users', loadChildren: () => import('./modules/users/users.module').then(m => m.UsersModule) }, { path: 'products', loadChildren: () => import('./modules/products/products.module').then(m => m.ProductsModule) }];

// @NgModule({
//   imports: [RouterModule.forRoot(routes)],
//   exports: [RouterModule]
// })
// export class AppRoutingModule { }
