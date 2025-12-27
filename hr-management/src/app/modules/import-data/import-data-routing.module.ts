import { RouterModule, Routes } from '@angular/router';
import { ImportAttendanceComponent } from './import-attendance/import-attendance.component';
import { ImportCheckInOutComponent } from './import-check-in-out/import-check-in-out.component';
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
    path: 'check-in-out',
    component: ImportCheckInOutComponent,
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
