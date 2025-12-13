import { Component, Input, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { scheduleStatus } from '../special-schedule.constant';

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

  constructor(private modalRef: NzModalRef) {}

  ngOnInit(): void {
  }

  destroyModal() {
    this.modalRef.destroy();
  }

  getStatusOption(key: string): any {
    return scheduleStatus.find((option: any) => option.value === key) || { label: key, color: 'default' };
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
}
