import { Component, Input, OnInit } from '@angular/core';
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
  @Input() data: any;
  modalTitle = 'Thêm mới lịch đặc thù'; // Default title

  constructor(
    private fb: FormBuilder,
    private modalRef: NzModalRef,
    private message: NzMessageService,
    private specialScheduleService: SpecialScheduleService
  ) { }

  ngOnInit(): void {
    if (this.data) {
        this.modalTitle = 'Cập nhật lịch đặc thù';
    }

    this.addForm = this.fb.group({
      // Pass the date string directly (YYYY-MM-DD) for input type="date"
      startDate: [this.data?.startDate || null],
      endDate: [this.data?.endDate || null],
      morningStart: [this.parseTime(this.data?.morningStart)],
      morningEnd: [this.parseTime(this.data?.morningEnd)],
      afternoonStart: [this.parseTime(this.data?.afternoonStart)],
      afternoonEnd: [this.parseTime(this.data?.afternoonEnd)],
      projectCode: [this.data?.projectCode || null, [Validators.required]],
      projectName: [this.data?.projectName || null, [Validators.required]],
      managerCode: [this.data?.managerCode || null, [Validators.required]],
      managerName: [this.data?.managerName || null, [Validators.required]],
      type: [this.data?.type || 'ON_SITE'],
      reason: [this.data?.reason || null]
    });
  }

  private parseDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    return new Date(dateStr);
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  private formatTime(date: Date): string {
    if (!date) return '';
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    return `${hours}:${minutes}:${seconds}`;
  }

  parseTime(timeStr: string): Date | null {
    if (!timeStr) return null;
    const date = new Date();
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    date.setHours(hours || 0);
    date.setMinutes(minutes || 0);
    date.setSeconds(seconds || 0);
    return date;
  }

  submit(): void {
    if (this.addForm.invalid || this.addForm.pristine) { // Check pristine to avoid sending duplicate data
      this.addForm.markAllAsTouched();
      return;
    }
    this.loading = true;

    // Form value is already in correct format for strings
    const formValue = { ...this.addForm.value };

    // Format times back to HH:mm:ss string
    if (formValue.morningStart instanceof Date) formValue.morningStart = this.formatTime(formValue.morningStart);
    if (formValue.morningEnd instanceof Date) formValue.morningEnd = this.formatTime(formValue.morningEnd);
    if (formValue.afternoonStart instanceof Date) formValue.afternoonStart = this.formatTime(formValue.afternoonStart);
    if (formValue.afternoonEnd instanceof Date) formValue.afternoonEnd = this.formatTime(formValue.afternoonEnd);
    
    let request;
    if (this.data && this.data.id) {
        request = this.specialScheduleService.updateSpecialScheduleApi(this.data.id, formValue);
    } else {
        request = this.specialScheduleService.createSpecialScheduleApi(formValue);
    }

    request.subscribe({
        next: () => {
          this.message.success(this.data ? 'Cập nhật lịch đặc thù thành công!' : 'Thêm mới lịch đặc thù thành công!');
          this.modalRef.close(true);
        },
        error: (err) => {
          this.message.error((this.data ? 'Cập nhật' : 'Thêm mới') + ' thất bại!');
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
