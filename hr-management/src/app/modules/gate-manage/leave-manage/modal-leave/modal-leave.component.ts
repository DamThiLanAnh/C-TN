import { Component, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-modal-leave',
  templateUrl: './modal-leave.component.html',
  styleUrls: ['./modal-leave.component.scss']
})
export class ModalLeaveComponent implements OnInit {
  modalTitle= 'Xem chi tiết vắng mặt';
  // Mock data for testing
  itemData: any = {
    employeeUserName: 'NV001',
    employeeName: 'Nguyễn Văn A',
    employeeEmail: 'nguyenvana@example.com',
    organizationName: 'Phòng Kinh Doanh',
    absenceTypeName: 'Nghỉ phép năm',
    startDate: new Date('2025-12-10T08:00:00'),
    endDate: new Date('2025-12-10T17:00:00'),
    absenceStatus: 'WAITING_FOR_APPROVE', // Options: 'WAITING_FOR_APPROVE', 'APPROVED', 'REJECTED'
    absenceReason: 'Xin nghỉ phép để đi du lịch cùng gia đình',
    rejectReason: 'Không đủ số ngày phép'
  };

  rolesApproveLeave = ['ADMIN', 'MANAGER']; // Mock roles for approval

  constructor(private modalRef: NzModalRef) { }

  ngOnInit(): void {
    // Initialize component
  }

  // Get status options with color and label
  getStatusOption(status: string): { color: string; label: string } {
    const statusMap: any = {
      'WAITING_FOR_APPROVE': { color: '#FFA500', label: 'Chờ duyệt' },
      'APPROVED': { color: '#52C41A', label: 'Đã duyệt' },
      'REJECTED': { color: '#FF4D4F', label: 'Từ chối' }
    };
    return statusMap[status] || { color: '#D9D9D9', label: 'Không xác định' };
  }

  // Accept the leave request
  accept(): void {
    console.log('Accepting leave request:', this.itemData);
    this.itemData.absenceStatus = 'APPROVED';
    // TODO: Call API to approve leave request
    this.modalRef.close({ action: 'accept', data: this.itemData });
  }

  // Reject the leave request
  reject(): void {
    console.log('Rejecting leave request:', this.itemData);
    this.itemData.absenceStatus = 'REJECTED';
    // TODO: Call API to reject leave request
    this.modalRef.close({ action: 'reject', data: this.itemData });
  }

  // Close modal
  destroyModal(): void {
    console.log('Closing modal');
    this.modalRef.close();
  }

}
