import { RouterModule, Routes } from '@angular/router';
import { WelcomeComponent } from './welcome.component';
import { NgModule } from '@angular/core';

export const WELCOME_ROUTES: Routes = [
  { path: '', component: WelcomeComponent },
];

@NgModule({
  imports: [
    RouterModule.forChild(WELCOME_ROUTES)
  ],
  exports: [RouterModule]
})
export class WelcomeRoutingModule { }
