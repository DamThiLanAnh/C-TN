import { NgModule } from '@angular/core';
import { SettingComponent } from './setting/setting.component';
import { UserAccountComponent } from './user-account/user-account.component';
import { SettingRoutingModule } from './setting-routing.module';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { ActivityLogComponent } from './activity-log/activity-log.component';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

@NgModule({
  imports: [
    CommonModule,
    SettingRoutingModule,
    NzCardModule,
    NzTableModule,
    NzTabsModule,
    NzIconModule,
    NzButtonModule,
    NzDropDownModule,
    NzInputModule,
    FormsModule,
    NzDatePickerModule,
    NzTimePickerModule,
    NzPaginationModule,
    NzTagModule,
    NzModalModule,
    NzMessageModule,
    NzCheckboxModule
  ],
  declarations: [
    SettingComponent,
    UserAccountComponent,
    ActivityLogComponent
  ],
  providers: [
  ],
  exports: []
})
export class SettingModule { }
