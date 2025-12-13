import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './modal-confirmation.component.html',
  styleUrls: ['./modal-confirmation.component.scss']
})
export class ModalConfirmationComponent {
  @Input() title!: string;                
  @Input() message?: string;              
  @Input() showReasonBox: boolean = false; 
  @Input() reasonLabel: string = 'Lý do'; 

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalRef: NzModalRef,
    private messageService: NzMessageService
  ) {
    this.form = this.fb.group({
      reason: [''],
    });
  }

  getButtonType() {
    return this.showReasonBox ? 'close-circle' : 'check-circle'
  }

  submit(): void {
    if (this.showReasonBox && !this.form.value.reason) {
      this.form.get('reason')?.setErrors({ required: true });
      this.messageService.error('Lý do từ chối không được để trống');
      return;
    }
    this.modalRef.close(this.form.value.reason || true); 
  }

  cancel(): void {
    this.modalRef.close(null);
  }
}
