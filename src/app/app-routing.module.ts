import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { AdminLayoutComponent } from './core/layouts/admin-layout/admin-layout.component';
import { RoleHomeRedirectComponent } from './core/layouts/role-home-redirect/role-home-redirect.component';
import { UserLayoutComponent } from './core/layouts/user-layout/user-layout.component';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then((m) => m.AuthModule)
  },
  {
    path: '',
    component: RoleHomeRedirectComponent,
    canActivate: [AuthGuard],
    pathMatch: 'full'
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    canMatch: [RoleGuard],
    data: { roles: ['admin'] },
    children: [
      {
        path: 'products',
        loadChildren: () => import('./modules/products/products.module').then((m) => m.ProductsModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./modules/profile/profile.module').then((m) => m.ProfileModule)
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./modules/dashboard/dashboard.module').then((m) => m.DashboardModule)
      },
      {
        path: 'users',
        canActivate: [RoleGuard],
        data: { roles: ['admin'] },
        loadChildren: () => import('./modules/users/users.module').then((m) => m.UsersModule)
      }
    ]
  },
  {
    path: '',
    component: UserLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'products',
        loadChildren: () => import('./modules/products/products.module').then((m) => m.ProductsModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./modules/profile/profile.module').then((m) => m.ProfileModule)
      }
    ]
  },
  {
    path: 'login',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
