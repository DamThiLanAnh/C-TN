import { RouterModule, Routes } from '@angular/router';
import { LayoutFullComponent } from './layout/layout-full/layout-full.component';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/login' },
  {
    path: 'login',
    loadChildren: () => import('./modules/login/login.module').then(m => m.LoginModule)
  },
  {
    path: '',
    component: LayoutFullComponent,
    children: [
      {
        path: 'welcome',
        loadChildren: () => import('./modules/welcome/welcome.module').then(m => m.WelcomeModule)
      },
      {
        path: 'staffs/user-information',
        loadChildren: () => import('./modules/staffs/staffs.module').then(m => m.StaffsModule)
      },
      {
        path: 'staffs',
        loadChildren: () => import('./modules/staffs/staffs.module').then(m => m.StaffsModule)
      },
      {
        path: 'gate-manage',
        loadChildren: () => import('./modules/gate-manage/gate-manage.module').then(m => m.GateManageModule)
      },
      {
        path: 'employee-manage',
        loadChildren: () => import('./modules/employee-manage/employee-manage.module').then(m => m.EmployeeManageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRouting {

}
