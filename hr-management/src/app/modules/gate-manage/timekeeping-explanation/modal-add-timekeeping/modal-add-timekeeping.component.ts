import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TimekeepingExplanationService, TimekeepingExplanationRequest } from '../timekeeping-explanation.service';

@Component({
  selector: 'app-modal-add-timekeeping',
  templateUrl: './modal-add-timekeeping.component.html',
  styleUrls: ['./modal-add-timekeeping.component.scss']
})
export class ModalAddTimekeepingComponent implements OnInit {
  timekeepingForm!: FormGroup;
  isSubmitting = false;
  modalTitle = 'Thêm mới giải trình công';

  constructor(
    private fb: FormBuilder,
    private modalRef: NzModalRef,
    private service: TimekeepingExplanationService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.timekeepingForm = this.fb.group({
      workDate: [null, [Validators.required]],
      proposedCheckIn: ['', [Validators.required, Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
      proposedCheckOut: ['', [Validators.required, Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
      reason: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  onSubmit(): void {
    if (this.timekeepingForm.valid) {
      this.isSubmitting = true;

      const formValue = this.timekeepingForm.value;
      const request: TimekeepingExplanationRequest = {
        workDate: this.formatDate(formValue.workDate),
        proposedCheckIn: formValue.proposedCheckIn,
        proposedCheckOut: formValue.proposedCheckOut,
        reason: formValue.reason
      };

      console.log('Submitting timekeeping explanation:', request);

      this.service.addTimekeepingExplanation(request).subscribe(
        (response) => {
          this.message.success('Tạo giải trình công thành công!');
          this.modalRef.close({ success: true, data: response });
        },
        (error) => {
          console.error('Error creating timekeeping explanation:', error);
          this.message.error('Không thể tạo giải trình công. Vui lòng thử lại!');
          this.isSubmitting = false;
        }
      );
    } else {
      Object.values(this.timekeepingForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onCancel(): void {
    this.modalRef.close();
  }

  // Date validation: cannot select future dates
  disabledDate = (current: Date): boolean => {
    return current && current.getTime() > Date.now();
  };
}

