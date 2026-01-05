import { RouterModule, Routes } from '@angular/router';
import { StaffDetailComponent } from './staff-detail/staff-detail.component';
import { NgModule } from '@angular/core';

export const STAFFS_ROUTES: Routes = [
  {
    path: 'detail',
    component: StaffDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(STAFFS_ROUTES)],
  exports: [RouterModule]
})
export class StaffsRoutingModule { }
