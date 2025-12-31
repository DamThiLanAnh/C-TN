import { Component, Input, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { scheduleStatus } from '../special-schedule.constant';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SpecialScheduleService } from '../special-schedule.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'modal-view-detail-app-special-schedule',
  templateUrl: './modal-view-detail-special-schedule.component.html',
  styleUrls: ['./modal-view-detail-special-schedule.component.scss'],
})
export class ModalViewDetailSpecialScheduleComponent implements OnInit {
  @Input() item: any;
  @Input() onApprove?: (item: any) => void;
  @Input() onReject?: (item: any) => void;
  @Input() canApprove: boolean = true;
  @Input() mode: 'view' | 'edit' = 'view';
  @Input() onUpdate?: () => void;

  editForm!: FormGroup;
  loading = false;

  constructor(
    private modalRef: NzModalRef,
    private fb: FormBuilder,
    private specialScheduleService: SpecialScheduleService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    if (this.mode === 'edit') {
      this.editForm = this.fb.group({
        startDate: [this.item?.startDate, [Validators.required]],
        endDate: [this.item?.endDate, [Validators.required]],
        morningStart: [this.item?.morningStart, [Validators.required]],
        morningEnd: [this.item?.morningEnd, [Validators.required]],
        afternoonStart: [this.item?.afternoonStart, [Validators.required]],
        afternoonEnd: [this.item?.afternoonEnd, [Validators.required]],
        projectCode: [this.item?.projectCode],
        projectName: [this.item?.projectName],
        managerCode: [this.item?.managerCode],
        managerName: [this.item?.managerName],
        reason: [this.item?.reason, [Validators.required]],
      });
    }
  }

  destroyModal() {
    this.modalRef.destroy();
  }

  getStatusOption(key: string): any {
    return (
      scheduleStatus.find((option: any) => option.value === key) || {
        label: key,
        color: 'default',
      }
    );
  }

  approve() {
    if (this.onApprove) {
      this.onApprove(this.item);
      this.modalRef.destroy();
    }
  }

  reject() {
    if (this.onReject) {
      this.onReject(this.item);
      this.modalRef.destroy();
    }
  }

  submitEdit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.specialScheduleService
      .updateSpecialScheduleApi(this.item.id, this.editForm.value)
      .subscribe({
        next: () => {
          this.message.success('Cập nhật lịch đặc thù thành công!');
          this.modalRef.close(true);
          if (this.onUpdate) this.onUpdate();
        },
        error: () => {
          this.message.error('Cập nhật thất bại!');
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
}
