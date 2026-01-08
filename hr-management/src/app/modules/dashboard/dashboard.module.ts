import { DashboardRoutingModule } from './dashboard-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    NzCardModule,
    NzIconModule,
    NgChartsModule,
    NzSpinModule,
    NzAlertModule,
    NzSpinModule,
    NzAlertModule,
    NzEmptyModule,
    NzDatePickerModule,
    FormsModule
  ],
  providers: [],
  exports: []
})
export class DashboardModule { }

