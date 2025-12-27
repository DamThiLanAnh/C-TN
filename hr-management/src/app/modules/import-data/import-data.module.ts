import { NgModule } from '@angular/core';
import { ImportDataRoutingModule } from './import-data-routing.module';
import { ImportCheckInOutComponent } from './import-check-in-out/import-check-in-out.component';
import { ImportAttendanceComponent } from './import-attendance/import-attendance.component';
import { ImportDataComponent } from './import-data/import-data.component';

@NgModule({
    declarations: [
      ImportCheckInOutComponent,
      ImportAttendanceComponent,
      ImportDataComponent
    ],
    imports: [
      ImportDataRoutingModule
    ]
})
export class ImportDataModule { }
