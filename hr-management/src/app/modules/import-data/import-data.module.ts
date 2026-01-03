import { NgModule } from '@angular/core';
import { ImportDataRoutingModule } from './import-data-routing.module';
import { ImportCheckInOutComponent } from './import-check-in-out/import-check-in-out.component';
import { ImportAttendanceComponent } from './import-attendance/import-attendance.component';
import { ImportDataComponent } from './import-data/import-data.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { CommonModule } from '@angular/common';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ImportCheckInOutComponent,
    ImportAttendanceComponent,
    ImportDataComponent
  ],
  imports: [
    ImportDataRoutingModule,
    NzButtonModule,
    NzFormModule,
    NzCardModule,
    NzIconModule,
    NzTableModule,
    NzPaginationModule,
    CommonModule,
    NzDatePickerModule,
    NzUploadModule,
    NzMessageModule,
    NzModalModule,
    FormsModule,
    ReactiveFormsModule
  ],
})
export class ImportDataModule { }
