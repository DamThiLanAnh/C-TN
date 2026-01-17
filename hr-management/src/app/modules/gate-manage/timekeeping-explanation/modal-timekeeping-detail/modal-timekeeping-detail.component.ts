import { Component, Input, OnInit } from '@angular/core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TimekeepingExplanationService } from '../timekeeping-explanation.service';
import { ConfirmModalComponent } from '../../../shares/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-modal-timekeeping-detail',
  templateUrl: './modal-timekeeping-detail.component.html',
  styleUrls: ['./modal-timekeeping-detail.component.scss']
})
export class ModalTimekeepingDetailComponent implements OnInit {
  modalTitle = 'Xem chi tiết giải trình công';

  @Input() itemData: any;
  @Input() canApprove: boolean = false;

  rolesApproveTimekeeping = ['ADMIN', 'MANAGER', 'HR']; // Cac quyen duoc duyet

  constructor(
    private modalRef: NzModalRef,
    private modal: NzModalService,
    private service: TimekeepingExplanationService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    // Khoi tao component
  }

  // Lay tuy chon trang thai voi mau va nhan
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

  // Duyet yeu cau giai trinh cong
  accept(): void {
    if (!this.itemData?.id) {
      this.message.error('Không tìm thấy ID giải trình công');
      return;
    }

    const modal = this.modal.create({
      nzContent: ConfirmModalComponent,
      nzFooter: null,
      nzClassName: 'custom-confirm-modal',
      nzComponentParams: {
        type: 'approve',
        title: 'Xác nhận duyệt',
        content: 'Bạn có chắc chắn muốn duyệt đơn giải trình công này?'
      }
    });

    modal.afterClose.subscribe((result) => {
      if (result && result.success) {
        this.processDecision('APPROVE', result.reason);
      }
    });
  }

  // Tu choi yeu cau giai trinh cong
  reject(): void {
    if (!this.itemData?.id) {
      this.message.error('Không tìm thấy ID giải trình công');
      return;
    }

    const modal = this.modal.create({
      nzContent: ConfirmModalComponent,
      nzFooter: null,
      nzClassName: 'custom-confirm-modal',
      nzComponentParams: {
        type: 'reject',
        title: 'Xác nhận từ chối',
        content: 'Bạn có chắc chắn muốn từ chối đơn giải trình công này?',
        requireReason: true
      }
    });

    modal.afterClose.subscribe((result) => {
      if (result && result.success) {
        this.processDecision('REJECT', result.reason);
      }
    });
  }

  private processDecision(action: 'APPROVE' | 'REJECT', reason?: string): void {
    const body = {
      ids: [this.itemData.id],
      action: action,
      managerNote: reason || ''
    };

    this.service.bulkDecisionTimekeepingExplanationApi(body).subscribe(
      (res: any) => {
        // Xu ly phan hoi voi danh sach thanh cong va that bai
        const successCount = res.success ? res.success.length : 0;
        const failedCount = res.failed ? res.failed.length : 0;

        if (successCount > 0) {
          this.message.success(`${action === 'APPROVE' ? 'Duyệt' : 'Từ chối'} giải trình công thành công!`);
          this.modalRef.close({ action: action === 'APPROVE' ? 'accept' : 'reject', data: this.itemData });
        } else if (failedCount > 0) {
          // Neu myc duy nhat that bai
          this.message.error(`Không thể ${action === 'APPROVE' ? 'duyệt' : 'từ chối'} giải trình công này.`);
        } else {
          // Du phong
          this.message.success(`${action === 'APPROVE' ? 'Duyệt' : 'Từ chối'} giải trình công thành công!`);
          this.modalRef.close({ action: action === 'APPROVE' ? 'accept' : 'reject', data: this.itemData });
        }
      },
      (error) => {
        console.error(`Error processing timekeeping explanation:`, error);
        const errorMessage = error.error?.message || error.error || error.message || 'Lỗi không xác định';
        this.message.error(`Không thể ${action === 'APPROVE' ? 'duyệt' : 'từ chối'}: ${errorMessage}`);
      }
    );
  }

  // Dong modal
  destroyModal(): void {
    this.modalRef.close();
  }
}

