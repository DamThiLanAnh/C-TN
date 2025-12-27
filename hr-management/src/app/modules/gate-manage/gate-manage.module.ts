import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LeaveManageComponent } from './leave-manage/leave-manage.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { TimekeepingExplanationComponent } from './timekeeping-explanation/timekeeping-explanation.component';
import { GateManageRoutingModule } from './gate-manage-routing.module';
import { ModalLeaveComponent } from './leave-manage/modal-leave/modal-leave.component';
import { ModalAddLeaveComponent } from './leave-manage/modal-add-leave/modal-add-leave.component';
import { SpecialScheduleModule } from './special-schedule/special-schedule.module';
import { GateManageComponent } from './gate-manage/gate-manage.component';
import {
  ModalTimekeepingDetailComponent
} from './timekeeping-explanation/modal-timekeeping-detail/modal-timekeeping-detail.component';
import {
  ModalAddTimekeepingComponent
} from './timekeeping-explanation/modal-add-timekeeping/modal-add-timekeeping.component';
import { SafeHtmlPipe } from '../shares/pipes/safe-html.pipe';

@NgModule(
  {
    imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
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
      NzMessageModule,
      NzFormModule,
      NzInputModule,
      NzDatePickerModule,
      NzInputNumberModule,
      NzToolTipModule,
      SpecialScheduleModule,
    ],
    declarations: [
      GateManageComponent,
      LeaveManageComponent,
      TimekeepingExplanationComponent,
      ModalLeaveComponent,
      ModalAddLeaveComponent,
      ModalAddTimekeepingComponent,
      ModalTimekeepingDetailComponent,
      SafeHtmlPipe
    ],
    exports: []
  })
export class GateManageModule {
}
