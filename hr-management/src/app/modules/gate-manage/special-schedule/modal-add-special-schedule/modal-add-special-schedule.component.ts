import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SpecialScheduleService } from '../special-schedule.service';

@Component({
  selector: 'app-modal-add-special-schedule',
  templateUrl: './modal-add-special-schedule.component.html',
  styleUrls: ['./modal-add-special-schedule.component.scss']
})
export class ModalAddSpecialScheduleComponent implements OnInit {
  addForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private modalRef: NzModalRef,
    private message: NzMessageService,
    private specialScheduleService: SpecialScheduleService
  ) { }

  ngOnInit(): void {
    this.addForm = this.fb.group({
      employeeCode: [null, [Validators.required]],
      startDate: [null, [Validators.required]],
      endDate: [null, [Validators.required]],
      morningStart: [null, [Validators.required]],
      morningEnd: [null, [Validators.required]],
      afternoonStart: [null, [Validators.required]],
      afternoonEnd: [null, [Validators.required]],
      projectCode: [null, [Validators.required]],
      projectName: [null, [Validators.required]],
      managerCode: [null, [Validators.required]],
      managerName: [null, [Validators.required]],
      type: [null, [Validators.required]],
      reason: [null]
    });
  }

  submit(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.specialScheduleService.createSpecialScheduleApi(this.addForm.value)
      .subscribe({
        next: () => {
          this.message.success('Thêm mới lịch đặc thù thành công!');
          this.modalRef.close(true);
        },
        error: (err) => {
          this.message.error('Thêm mới thất bại!');
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  close(): void {
    this.modalRef.close(false);
  }
}
