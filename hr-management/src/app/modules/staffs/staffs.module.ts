import { NgModule } from '@angular/core'
import { CommonModule, NgStyle } from '@angular/common'
import { StaffCalenderComponent } from './staff-calender/staff-calender.component'

@NgModule({
  imports: [
    CommonModule,
    NgStyle,
    StaffCalenderComponent
  ],
  exports: [
    StaffCalenderComponent
  ]
})
export class StaffsModule {
}
