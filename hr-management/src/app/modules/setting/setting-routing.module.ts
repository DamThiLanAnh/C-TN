import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { UserAccountComponent } from './user-account/user-account.component';
import { ActivityLogComponent } from './activity-log/activity-log.component';

const routes: Routes = [
  {
    path: 'user-account',
    component: UserAccountComponent,
    // canActivate: [PermissionGuard],
    data: {
      roles: []
    }
  },
  {
    path: 'approve-schedule-config',
    loadChildren: () =>
      import('./approve-schedule-config/approve-schedule-config.module').then((m) => m.ApproveScheduleConfigModule),
    // canActivate: [PermissionGuard],
    data: {
      roles: []
    }
  },
  {
    path: 'activity-log',
    component: ActivityLogComponent,
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingRoutingModule { }
