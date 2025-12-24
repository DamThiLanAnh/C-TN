import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { StaffsModule } from './modules/staffs/staffs.module';
import { WelcomeModule } from './modules/welcome/welcome.module';
import { LayoutModule } from './layout/layout.module';
import { LoginModule } from './modules/login/login.module';
import { AppRouting } from './app-routing.module';
import { AuthInterceptor } from './interceptors/auth.interceptor';

// Import locale tiếng Việt cho Ng-Zorro
import { NZ_I18N, vi_VN } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import vi from '@angular/common/locales/vi';
import { EmployeeManageComponent } from './modules/employee-manage/employee-manage/employee-manage.component';
import { SettingComponent } from './modules/setting/setting.component';

registerLocaleData(vi);

@NgModule({
  declarations: [
    AppComponent,
    SettingComponent,
  ],
  imports: [
    AppRouting,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    LayoutModule,
    LoginModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzButtonModule,
    StaffsModule
  ],
  providers: [
    { provide: NZ_I18N, useValue: vi_VN },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
