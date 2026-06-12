import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPurchasesComponent } from './admin-purchases.component';
import { AppointmentsCalendarComponent } from './appointments-calendar.component';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'purchases', component: AdminPurchasesComponent },
  { path: 'appointments', component: AppointmentsCalendarComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
