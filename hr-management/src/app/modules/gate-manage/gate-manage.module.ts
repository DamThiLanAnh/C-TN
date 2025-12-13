import { NgModule } from '@angular/core';
import { LeaveManageComponent } from './leave-manage/leave-manage.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { TimekeepingExplanationComponent } from './timekeeping-explanation/timekeeping-explanation.component';
import { ApproveScheduleConfigComponent } from './approve-schedule-config/approve-schedule-config.component';
import { GateManageRoutingModule } from './gate-manage-routing.module';
import { ModalLeaveComponent } from './leave-manage/modal-leave/modal-leave.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageModule } from 'ng-zorro-antd/message';

import { SpecialScheduleModule } from './special-schedule/special-schedule.module';
import { GateManageComponent } from './gate-manage/gate-manage.component';

@NgModule(
  {
    imports: [
      NzMessageModule,
      CommonModule,
      GateManageRoutingModule,
      NzCardModule,
      NzGridModule,
      NzButtonModule,
      NzIconModule,
      NzTableModule,
      NzPaginationModule,
      NzCheckboxModule,
      NzSelectModule,
      NzDropDownModule,
      NzModalModule,
      NzTagModule,
      NzSpinModule,
      NzDividerModule,
      SpecialScheduleModule
    ],
    declarations: [
      GateManageComponent,
      LeaveManageComponent,
      TimekeepingExplanationComponent,
      ApproveScheduleConfigComponent,
      ModalLeaveComponent
    ],
    exports: []
  })
export class GateManageModule {}
