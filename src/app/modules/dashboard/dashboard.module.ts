import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { AdminPurchasesComponent } from './admin-purchases.component';
import { AppointmentsCalendarComponent } from './appointments-calendar.component';
import { DashboardComponent } from './dashboard.component';

@NgModule({
  declarations: [DashboardComponent, AdminPurchasesComponent, AppointmentsCalendarComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule {}
