import { Component, Input, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TimekeepingExplanationService } from '../timekeeping-explanation.service';

@Component({
  selector: 'app-modal-timekeeping-detail',
  templateUrl: './modal-timekeeping-detail.component.html',
  styleUrls: ['./modal-timekeeping-detail.component.scss']
})
export class ModalTimekeepingDetailComponent implements OnInit {
  modalTitle = 'Xem chi tiết giải trình công';

  @Input() itemData: any;

  rolesApproveTimekeeping = ['ADMIN', 'MANAGER', 'HR']; // Roles with approval rights

  constructor(
    private modalRef: NzModalRef,
    private service: TimekeepingExplanationService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    // Initialize component
    console.log('Timekeeping detail data:', this.itemData);
  }

  // Get status options with color and label
  getStatusOption(status: string): { color: string; label: string } {
    const statusMap: any = {
      'Chờ duyệt': { color: '#FFA500', label: 'Chờ duyệt' },
      'Đã duyệt': { color: '#52C41A', label: 'Đã duyệt' },
      'Từ chối': { color: '#FF4D4F', label: 'Từ chối' },
      'PENDING': { color: '#FFA500', label: 'Chờ duyệt' },
      'APPROVED': { color: '#52C41A', label: 'Đã duyệt' },
      'REJECTED': { color: '#FF4D4F', label: 'Từ chối' }
    };
    return statusMap[status] || { color: '#D9D9D9', label: 'Không xác định' };
  }

  // Accept the timekeeping explanation request
  accept(): void {
    if (!this.itemData?.id) {
      this.message.error('Không tìm thấy ID giải trình công');
      return;
    }

    console.log('Accepting timekeeping explanation:', this.itemData);

    this.service.approveTimekeepingExplanation(this.itemData.id).subscribe(
      (response) => {
        this.message.success('Duyệt giải trình công thành công!');
        this.modalRef.close({ action: 'accept', data: this.itemData });
      },
      (error) => {
        console.error('Error approving timekeeping explanation:', error);
        this.message.error('Không thể duyệt giải trình công. Vui lòng thử lại!');
      }
    );
  }

  // Reject the timekeeping explanation request
  reject(): void {
    if (!this.itemData?.id) {
      this.message.error('Không tìm thấy ID giải trình công');
      return;
    }

    console.log('Rejecting timekeeping explanation:', this.itemData);

    this.service.rejectTimekeepingExplanation(this.itemData.id).subscribe(
      (response) => {
        this.message.success('Từ chối giải trình công thành công!');
        this.modalRef.close({ action: 'reject', data: this.itemData });
      },
      (error) => {
        console.error('Error rejecting timekeeping explanation:', error);
        this.message.error('Không thể từ chối giải trình công. Vui lòng thử lại!');
      }
    );
  }

  // Close modal
  destroyModal(): void {
    console.log('Closing modal');
    this.modalRef.close();
  }
}

