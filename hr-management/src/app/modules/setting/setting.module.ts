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
import { ActivityLogComponent } from './activity-log/activity-log.component';

@NgModule({
  imports: [
    CommonModule,
    SettingRoutingModule,
    NzCardModule,
    NzTableModule,
    NzTabsModule,
    NzIconModule,
    NzButtonModule
  ],
  declarations: [
    SettingComponent,
    UserAccountComponent,
    ActivityLogComponent
  ],
  exports: []
})
export class SettingModule { }
