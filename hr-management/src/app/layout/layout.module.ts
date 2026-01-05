import { NgModule } from '@angular/core';
import { LayoutFullComponent } from './layout-full/layout-full.component';
import { CommonModule } from '@angular/common';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { OverlayModule } from '@angular/cdk/overlay';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { MenuComponent } from './menu/menu.component';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { RouterModule } from '@angular/router';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzNotificationModule } from 'ng-zorro-antd/notification';

@NgModule({
  declarations: [
    LayoutFullComponent,
    MenuComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    NzLayoutModule,
    NzTabsModule,
    NzPopoverModule,
    NzBadgeModule,
    NzAvatarModule,
    NzToolTipModule,
    OverlayModule,
    NzIconModule,
    NzMenuModule,
    NzButtonModule,
    NzModalModule,
    ReactiveFormsModule,
    FormsModule,
    NzInputModule,
    NzFormModule,
    NzNotificationModule
  ],
  providers: [],
  exports: []
})
export class LayoutModule { }
