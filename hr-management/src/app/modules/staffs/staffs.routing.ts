import { RouterModule, Routes } from '@angular/router';
import { StaffCalenderComponent } from './staff-calender/staff-calender.component';
import { NgModule } from '@angular/core';

export const STAFFS_ROUTES: Routes = [
  {
    path: '',
    component: StaffCalenderComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(STAFFS_ROUTES)],
  exports: [RouterModule]
})
export class StaffsRoutingModule { }
