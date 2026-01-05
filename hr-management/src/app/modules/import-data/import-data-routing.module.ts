import { RouterModule, Routes } from '@angular/router';
import { ImportAttendanceComponent } from './import-attendance/import-attendance.component';
import { ImportSalaryComponent } from './import-salary/import-salary.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: 'attendance',
    component: ImportAttendanceComponent,
    // canActivate: [],
    data: {
      roles: []
    }
  },
  {
    path: 'salary',
    component: ImportSalaryComponent,
    // canActivate: [],
    data: {
      roles: []
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImportDataRoutingModule { }
