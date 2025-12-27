import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { StaffCostComponent } from './staff-cost.component';

const routes: Routes = [
  {
    path: '',
    component: StaffCostComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffCostRoutingModule { }
