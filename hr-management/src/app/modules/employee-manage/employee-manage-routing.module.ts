import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { EmployeeManageComponent } from './employee-manage/employee-manage.component';
import { DepartmentManageComponent } from './department-manage/department-manage.component';

const routes: Routes = [
  {
    path: 'employee-manage',
    component: EmployeeManageComponent,
    data: {
      roles: []
    }
  },
  {
    path: 'department-manage',
    component: DepartmentManageComponent,
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
