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
    NzButtonModule
  ],
  providers: [],
  exports: []
})
export class LayoutModule { }
