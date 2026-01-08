import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LeaveManagementService, LeaveRequest } from '../leave-manage.service';

@Component({
  selector: 'app-modal-add-leave',
  templateUrl: './modal-add-leave.component.html',
  styleUrls: ['./modal-add-leave.component.scss']
})
export class ModalAddLeaveComponent implements OnInit {
  leaveForm!: FormGroup;
  isSubmitting = false;
  modalTitle = 'Thêm mới đơn nghỉ phép';
  
  @Input() data: any; // Input to receive data for editing

  leaveTypes = [
    { value: 'ANNUAL', label: 'Nghỉ phép năm' },
    { value: 'UNPAID', label: 'Nghỉ không lương' },
    { value: 'OTHER', label: 'Khác' }
  ];

  constructor(
    private fb: FormBuilder,
    private modalRef: NzModalRef,
    private leaveService: LeaveManagementService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    if (this.data) {
      this.modalTitle = 'Cập nhật đơn nghỉ phép';
    }
    this.initForm();
  }

  initForm(): void {
    this.leaveForm = this.fb.group({
      employeeId: [this.data?.employeeId || null, [Validators.required]],
      type: [this.data?.type || 'ANNUAL', [Validators.required]],
      startDate: [this.data?.startDate ? new Date(this.data.startDate) : null, [Validators.required]],
      endDate: [this.data?.endDate ? new Date(this.data.endDate) : null, [Validators.required]],
      reason: [this.data?.absenceReason || '', [Validators.required, Validators.maxLength(500)]]
    });
  }

  onSubmit(): void {
    if (this.leaveForm.valid) {
      this.isSubmitting = true;

      const formValue = this.leaveForm.value;
      const leaveRequest: LeaveRequest = {
        employeeId: formValue.employeeId,
        type: formValue.type,
        startDate: this.formatDate(formValue.startDate),
        endDate: this.formatDate(formValue.endDate),
        reason: formValue.reason
      };

      let requestApi;
      if (this.data && this.data.id) {
          requestApi = this.leaveService.updateLeaveRequest(this.data.id, leaveRequest);
      } else {
          requestApi = this.leaveService.addLeaveRequest(leaveRequest);
      }

      requestApi.subscribe(
        (response) => {
          this.message.success(this.data ? 'Cập nhật đơn nghỉ phép thành công!' : 'Tạo đơn nghỉ phép thành công!');
          this.modalRef.close({ success: true, data: response });
        },
        (error) => {
          console.error('Error submitting leave request:', error);
          this.message.error('Có lỗi xảy ra. Vui lòng thử lại!');
          this.isSubmitting = false;
        }
      );
    } else {
      Object.values(this.leaveForm.controls).forEach(control => {
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

  // Date validation: end date must be after or equal to start date
  disabledEndDate = (endValue: Date): boolean => {
    if (!endValue || !this.leaveForm) {
      return false;
    }
    const startDate = this.leaveForm.get('startDate')?.value;
    return startDate ? endValue.getTime() < startDate.getTime() : false;
  };
}

