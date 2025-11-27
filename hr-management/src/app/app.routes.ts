import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/components/layout.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'welcome',
        loadChildren: () => import('./modules/welcome/welcome.routes').then(m => m.WELCOME_ROUTES)
      },
      {
        path: 'staffs',
        loadChildren: () => import('./modules/staffs/staffs.routing').then(m => m.STAFFS_ROUTES)
      }
    ]
  },
  {
    path: 'login',
    loadChildren: () => import('./modules/login/login-routing.module').then(m => m.LOGIN_ROUTES)
  }
];
