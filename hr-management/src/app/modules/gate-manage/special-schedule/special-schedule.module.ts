import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { SpecialScheduleComponent } from './special-schedule/special-schedule.component';
import { ModalConfirmationComponent } from './modal-confirmation/modal-confirmation.component';
import {
  ModalViewDetailSpecialScheduleComponent
} from './modal-view-detail-special-schedule/modal-view-detail-special-schedule.component';
import { SpecialScheduleService } from './special-schedule.service';

@NgModule({
  declarations: [
    SpecialScheduleComponent,
    ModalViewDetailSpecialScheduleComponent,
    ModalConfirmationComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzTagModule,
    NzFormModule,
    NzTableModule,
    NzPaginationModule,
    NzInputModule,
    NzDividerModule,
  ],
  providers: [SpecialScheduleService]
})
export class SpecialScheduleModule {}
