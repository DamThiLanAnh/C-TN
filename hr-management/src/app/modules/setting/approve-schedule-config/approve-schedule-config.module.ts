import { NgModule } from '@angular/core';
import { ApproveScheduleConfigComponent } from './components/approve-schedule-config/approve-schedule-config.component';
import {
  ApproveScheduleDepartmentConfigComponent
} from './components/approve-schedule-department-config/approve-schedule-department-config.component';
import { RuleAuthorizedDirective } from '../../shares/directives/rule-authorized.directive';
import { ApproveScheduleConfigRoutingModule } from './approve-schedule-config-routing.module';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzInputModule } from 'ng-zorro-antd/input';
import { OverlayModule } from '@angular/cdk/overlay';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

@NgModule({
  declarations: [
    ApproveScheduleConfigComponent,
    ApproveScheduleDepartmentConfigComponent,
    RuleAuthorizedDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    ApproveScheduleConfigRoutingModule,
    NzCardModule,
    NzIconModule,
    NzToolTipModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzDropDownModule,
    NzInputModule,
    OverlayModule,
    ScrollingModule,
    NzPaginationModule
  ],
  exports: [
    ApproveScheduleConfigComponent,
    ApproveScheduleDepartmentConfigComponent
  ]
})
export class ApproveScheduleConfigModule { }
