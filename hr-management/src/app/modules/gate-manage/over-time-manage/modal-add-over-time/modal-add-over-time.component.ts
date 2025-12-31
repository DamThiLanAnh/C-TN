import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { OverTimeManageService } from '../over-time-manage.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-modal-add-over-time',
  templateUrl: './modal-add-over-time.component.html',
  styleUrls: ['./modal-add-over-time.component.scss']
})
export class ModalAddOverTimeComponent implements OnInit {
  @Input() id: any;
  @Input() data: any;

  formGroup!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private modal: NzModalRef,
    private messageService: NzMessageService,
    private overTimeManageService: OverTimeManageService
  ) { }

  ngOnInit(): void {
    this.initForm();
    if (this.id) {
      this.patchValue();
    }
  }

  initForm(): void {
    this.formGroup = this.fb.group({
      employeeCode: [null, [Validators.required]],
      otDate: [null, [Validators.required]],
      startTime: [null, [Validators.required]],
      endTime: [null, [Validators.required]],
      reason: [null, [Validators.required]],
    });
  }

  patchValue(): void {
    if (this.data) {
        this.formGroup.patchValue({
            employeeCode: this.data.employeeCode,
            otDate: this.data.otDate, 
            reason: this.data.reason
        });
        
        if (this.data.startTime) {
             const start = new Date(); 
             const [h, m, s] = this.data.startTime.split(':');
             start.setHours(+h, +m, +s || 0);
             this.formGroup.get('startTime')?.setValue(start);
        }
        if (this.data.endTime) {
            const end = new Date(); 
            const [h, m, s] = this.data.endTime.split(':');
            end.setHours(+h, +m, +s || 0);
            this.formGroup.get('endTime')?.setValue(end);
       }
    }
  }

  onCancel(): void {
    this.modal.close(false);
  }

  onSave(): void {
    if (this.formGroup.invalid) {
      Object.values(this.formGroup.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    const formValue = this.formGroup.value;
    
    // Format payload without moment
    const otDate = new Date(formValue.otDate);
    const formattedDate = `${otDate.getFullYear()}-${('0' + (otDate.getMonth() + 1)).slice(-2)}-${('0' + otDate.getDate()).slice(-2)}`;

    const startTime = new Date(formValue.startTime);
    const formattedStartTime = `${('0' + startTime.getHours()).slice(-2)}:${('0' + startTime.getMinutes()).slice(-2)}:${('0' + startTime.getSeconds()).slice(-2)}`;

    const endTime = new Date(formValue.endTime);
    const formattedEndTime = `${('0' + endTime.getHours()).slice(-2)}:${('0' + endTime.getMinutes()).slice(-2)}:${('0' + endTime.getSeconds()).slice(-2)}`;

    const payload = {
        employeeCodes: [formValue.employeeCode],
        otDate: formattedDate,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        reason: formValue.reason,
    };

    if (this.id) {
        // Update
        this.isLoading = true;
        this.overTimeManageService.updateOverTimeApi(this.id, payload).pipe(
            finalize(() => this.isLoading = false)
        ).subscribe(res => {
            this.messageService.success('Cập nhật thành công');
            this.modal.close(true);
        }, err => {
            this.messageService.error(err.error?.message || 'Có lỗi xảy ra');
        });
    } else {
        // Create
        this.isLoading = true;
        this.overTimeManageService.createOverTimeApi(payload).pipe(
            finalize(() => this.isLoading = false)
        ).subscribe(res => {
            this.messageService.success('Thêm mới thành công');
            this.modal.close(true);
        }, err => {
            this.messageService.error(err.error?.message || 'Có lỗi xảy ra');
        });
    }
  }
}
