import { RouterModule, Routes } from '@angular/router';
import { StaffCalendarComponent } from './staff-calendar/staff-calendar.component';
import { NgModule } from '@angular/core';

export const STAFFS_ROUTES: Routes = [
  {
    path: '',
    component: StaffCalendarComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(STAFFS_ROUTES)],
  exports: [RouterModule]
})
export class StaffsRoutingModule { }
