import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ApproveScheduleConfigComponent } from './components/approve-schedule-config/approve-schedule-config.component';

const routes: Routes = [
  {
    path: '',
    component: ApproveScheduleConfigComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApproveScheduleConfigRoutingModule { }

