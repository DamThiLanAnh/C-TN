import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { EmployeeManageComponent } from './employee-manage/employee-manage.component';

const routes: Routes = [
  {
    path: '',
    component: EmployeeManageComponent,
    data: {
      roles: []
    }
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeManageRoutingModule {
}
