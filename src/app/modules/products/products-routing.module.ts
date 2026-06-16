import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from 'src/app/core/guards/role.guard';
import { BuildPcPageComponent } from './components/build-pc-page/build-pc-page.component';
import { CartPageComponent } from './components/cart-page/cart-page.component';
import { CategoriesPageComponent } from './components/categories-page/categories-page.component';
import { OrdersPageComponent } from './components/orders-page/orders-page.component';
import { ProductsComponent } from './products.component';

const routes: Routes = [
  { path: '', component: ProductsComponent },
  { path: 'home', component: ProductsComponent, data: { storeHome: true } },
  { path: 'favorites', component: ProductsComponent, data: { storeFavorites: true } },
  { path: 'build-pc', component: BuildPcPageComponent, canActivate: [RoleGuard], data: { roles: ['user'] } },
  { path: 'categories', component: CategoriesPageComponent },
  { path: 'cart', component: CartPageComponent },
  { path: 'orders', component: OrdersPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
