// src/app/app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router'; // Sử dụng RouterModule thay vì provideRouter

// 1. Khai báo Component của bạn
import { AppComponent } from './app.component';
// 2. Nhập các Component/Module khác mà bạn đã tạo (ví dụ: Layout)
import { LayoutComponent } from './layout/components/layout.component';
// import { SidebarComponent } from './layout/components/sidebar/sidebar.component';
// import { HeaderComponent } from './layout/components/header/header.component';

// 3. Nhập các Module Ng-Zorro-Antd cần thiết
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { StaffsModule } from './modules/staffs/staffs.module';
import { WelcomeModule } from './modules/welcome/welcome.module';
import { LayoutModule } from './layout/layout.module';
import { LoginModule } from './modules/login/login.module';

// Định nghĩa Routes của bạn (từ app-routing.module.ts cũ hoặc app.config.ts hiện tại)
const routes: Routes = [
  // Ví dụ về cấu hình routing
  {
    path: '',
    component: LayoutComponent, // Sử dụng layout component làm bố cục chính
    children: [
      { path: 'welcome', loadChildren: () => import('./modules/welcome/welcome.module').then(m => m.WelcomeModule) },
      // Thêm các routes khác của bạn vào đây
    ]
  },
];

@NgModule({
  declarations: [
    AppComponent,
    // Phải khai báo tất cả các component mà bạn sử dụng
    // SidebarComponent,
    // HeaderComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule, // Thay thế cho provideAnimationsAsync

    // Import RouterModule.forRoot() để cung cấp routing
    RouterModule.forRoot(routes),
    LayoutModule,
    LoginModule,
    // Import các module của Ng-Zorro-Antd để sử dụng các thẻ như <nz-layout>
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzButtonModule,
    StaffsModule
  ],
  providers: [
    // Nếu có các Service (dịch vụ) cũ, bạn có thể đưa chúng vào đây
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
