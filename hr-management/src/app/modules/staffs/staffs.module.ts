import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { StaffCalenderComponent } from './staff-calender/staff-calender.component'
import { StaffDetailComponent } from './staff-detail/staff-detail.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { FormsModule } from '@angular/forms';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { StaffsRoutingModule } from './staffs.routing';

@NgModule({
  imports: [
    CommonModule,
    NzCardModule,
    NzRadioModule,
    FormsModule,
    NzAvatarModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule,
    NzTimelineModule,
    NzListModule,
    NzTagModule,
    NzAlertModule,
    NzProgressModule,
    NzDatePickerModule,
    NzTableModule,
    NzSpinModule,
    NzInputModule,
    NzPopoverModule,
    NzCalendarModule,
    NzEmptyModule,
    StaffsRoutingModule
  ],
  exports: [],
  declarations: [
    StaffCalenderComponent,
    StaffDetailComponent
  ]
})
export class StaffsModule {
}
