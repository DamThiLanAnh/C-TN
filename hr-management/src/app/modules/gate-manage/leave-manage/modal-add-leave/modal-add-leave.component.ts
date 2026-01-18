import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LeaveManagementService, LeaveRequest } from '../leave-manage.service';

import { AuthService } from '../../../../services/auth.service';

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
    { value: 'PERSONAL', label: 'Nghỉ việc riêng' }
  ];

  leaveDurations = [
    { value: 'FULL_DAY', label: 'Cả ngày' },
    { value: 'MORNING', label: 'Sáng' },
    { value: 'AFTERNOON', label: 'Chiều' }
  ];

  constructor(
    private fb: FormBuilder,
    private modalRef: NzModalRef,
    private leaveService: LeaveManagementService,
    private message: NzMessageService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    if (this.data) {
      this.modalTitle = 'Cập nhật đơn nghỉ phép';
    }
    this.initForm();
  }

  initForm(): void {
    this.leaveForm = this.fb.group({
      type: [this.data?.type || 'ANNUAL', [Validators.required]],
      leaveDate: [this.data?.leaveDate ? new Date(this.data.leaveDate) : null, [Validators.required]],
      duration: [this.data?.duration || 'FULL_DAY', [Validators.required]],
      reason: [this.data?.absenceReason || '', [Validators.required, Validators.maxLength(500)]]
    });
  }

  onSubmit(): void {
    if (this.leaveForm.valid) {
      this.isSubmitting = true;

      const user = this.authService.getUser();
      // Fallback logic corresponding to AuthService: id or employeeId
      const currentEmployeeId = user ? (user.employeeId || user.id) : null;

      const formValue = this.leaveForm.value;
      const leaveRequest: LeaveRequest = {
        // Use existing employeeId if editing (from data), otherwise use logged-in user's ID
        employeeId: this.data?.employeeId || currentEmployeeId,
        type: formValue.type,
        leaveDate: this.formatDate(formValue.leaveDate),
        duration: formValue.duration, // Now sending duration string
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
}
