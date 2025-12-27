import { LeaveManageComponent } from './leave-manage/leave-manage.component';
import { RouterModule, Routes } from '@angular/router';
import { SpecialScheduleComponent } from './special-schedule/special-schedule/special-schedule.component';
import { NgModule } from '@angular/core';
import { TimekeepingExplanationComponent } from './timekeeping-explanation/timekeeping-explanation.component';

const routes: Routes = [
  {
    path: 'leave-manage',
    component: LeaveManageComponent,
    // canActivate: [PermissionGuard],
    data: {
      roles: []
    }
  },
  {
    path: 'special-schedule',
    component: SpecialScheduleComponent,
    // canActivate: [],
    data: {
      roles: []
    }
  },
  {
    path: 'timekeeping-explanation',
    component: TimekeepingExplanationComponent,
    data: {
      roles: []
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GateManageRoutingModule { }

