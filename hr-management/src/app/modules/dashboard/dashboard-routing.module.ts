import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { NgModule } from '@angular/core';

export const DASHBOARD_ROUTES: Routes = [
  { path: '', component: DashboardComponent },
];

@NgModule({
  imports: [
    RouterModule.forChild(DASHBOARD_ROUTES)
  ],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
