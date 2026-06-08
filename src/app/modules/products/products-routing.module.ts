import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CartPageComponent } from './components/cart-page/cart-page.component';
import { ProductsComponent } from './products.component';

const routes: Routes = [
  { path: '', component: ProductsComponent },
  { path: 'cart', component: CartPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
