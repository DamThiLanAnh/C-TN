import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, finalize } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { StandardColumnModel, StandardColumnType } from '../../shares/interfaces';
import { overTimeManageColumns } from './over-time-manage.column';
import { OverTimeManageService } from './over-time-manage.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AuthService } from '../../../services/auth.service';
import { ModalAddOverTimeComponent } from './modal-add-over-time/modal-add-over-time.component';

@Component({
  selector: 'app-over-time-manage',
  templateUrl: './over-time-manage.component.html',
  styleUrls: ['./over-time-manage.component.scss']
})
export class OverTimeManageComponent implements OnInit {
  listOfData: any[] = [];
  tableName = 'Quản lý tăng ca';
  
  overtimeColumns: StandardColumnModel[] = [];
  public StandardColumnType = StandardColumnType;
  public isManager = false;

  // Pagination
  paging = {
    pageIndex: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0
  };

  loadingTable = false;

  // Search stream
  public searchFilters: { [key: string]: any } = {};
  public searchSubject = new Subject<any>();

  fullDataList: any[] = []; // Cache for client-side filtering

  constructor(
    private messageService: NzMessageService,
    private overTimeManageService: OverTimeManageService,
    private modalService: NzModalService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const role = this.authService.getUserRole();
    this.isManager = this.authService.isManager();
    console.log('User Role:', role, 'Is Manager:', this.isManager);

    this.initColumns();
    this.setupStreamSearch();
    this.fetchDataFromServer();
  }

  private initColumns(): void {
    const allCols = overTimeManageColumns();
    // Filter out standard 'action' (Edit/Delete) for everyone as requested previously
    let activeCols = allCols.filter(col => col.name !== 'action');

    // If Employee (!isManager), show 'response_action'. If Manager, hide it.
    if (this.isManager) {
        activeCols = activeCols.filter(col => col.name !== 'response_action');
    }
    
    this.overtimeColumns = activeCols;
  }

  private setupStreamSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.paging.pageIndex = 1; // Reset to first page on search
      this.filterLocalData();
    });
  }

  private fetchDataFromServer(): void {
    this.loadingTable = true;
    const params = {
      page: 0,
      size: 20 // Get 20 to avoid 400 error as seen previously
    };

    this.overTimeManageService.getOverTimesApi(params).pipe(
      finalize(() => this.loadingTable = false)
    ).subscribe(
      (response) => {
        console.log('API OT Response:', response);
        
        if (Array.isArray(response)) {
          this.processAndSetData(response);
        } else if (response && response.content) {
          this.processAndSetData(response.content);
        } else {
          this.fullDataList = [];
        }

        this.filterLocalData();
      },
      (error) => {
        this.messageService.error('Không thể tải danh sách tăng ca: ' + (error.error || error.message || 'Error'));
        this.listOfData = [];
        this.fullDataList = [];
        this.paging.totalElements = 0;
      }
    );
  }

  private processAndSetData(data: any[]): void {
    const flattenedList: any[] = [];
    data.forEach(request => {
        if (request.participants && request.participants.length > 0) {
            request.participants.forEach((p: any) => {
                flattenedList.push({
                    ...request, // Request info: otDate, startTime, endTime, reason
                    ...p,       // Participant info: employeeCode, employeeName, status (override request status?)
                    // Keep explicit ID refs if needed, e.g. requestId: request.id
                    requestId: request.id,
                    participantId: p.id,
                    totalHour: this.calculateHours(request.startTime, request.endTime)
                });
            });
        } else {
            // Case where no participants (shouldn't happen ?) or just show request info
             flattenedList.push({
                ...request,
                 totalHour: this.calculateHours(request.startTime, request.endTime)
             });
        }
    });
    this.fullDataList = flattenedList;
  }

  private calculateHours(start: string, end: string): string {
    if (!start || !end) return '';
    try {
        // Assume HH:mm:ss format
        const startDate = new Date(`1970-01-01T${start}`);
        const endDate = new Date(`1970-01-01T${end}`);
        const diffMs = endDate.getTime() - startDate.getTime();
        const diffHrs = diffMs / (1000 * 60 * 60);
        return diffHrs.toFixed(1);
    } catch (e) {
        return '';
    }
  }

  private filterLocalData(): void {
    let processedData = [...this.fullDataList];

    // Client-side filtering logic
    if (this.searchFilters['employeeCode']) {
      const val = this.searchFilters['employeeCode'].toLowerCase().trim();
      processedData = processedData.filter((item: any) => item.employeeCode && item.employeeCode.toLowerCase().includes(val));
    }
    if (this.searchFilters['employeeName']) {
      const val = this.searchFilters['employeeName'].toLowerCase().trim();
      processedData = processedData.filter((item: any) => item.employeeName && item.employeeName.toLowerCase().includes(val));
    }
    if (this.searchFilters['status']) {
        const val = this.searchFilters['status'];
        processedData = processedData.filter((item: any) => item.status === val);
    }
    if (this.searchFilters['otDate']) {
        const date = new Date(this.searchFilters['otDate']);
        const val = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        processedData = processedData.filter((item: any) => item.otDate && item.otDate.includes(val));
    }
    if (this.searchFilters['reason']) {
        const val = this.searchFilters['reason'].toLowerCase().trim();
        processedData = processedData.filter((item: any) => item.reason && item.reason.toLowerCase().includes(val));
    }
    if (this.searchFilters['startTime']) {
        const val = this.searchFilters['startTime'].trim();
        processedData = processedData.filter((item: any) => item.startTime && item.startTime.includes(val));
    }
    if (this.searchFilters['endTime']) {
        const val = this.searchFilters['endTime'].trim();
        processedData = processedData.filter((item: any) => item.endTime && item.endTime.includes(val));
    }
    if (this.searchFilters['totalHour']) {
        const val = this.searchFilters['totalHour'].toString().trim();
        processedData = processedData.filter((item: any) => item.totalHour && item.totalHour.toString().includes(val));
    }

    // Update Total based on filtered result
    const total = processedData.length;
    this.paging.totalElements = total;
    this.paging.totalPages = Math.ceil(total / this.paging.pageSize) || 1;

    // Client-side pagination
    const start = (this.paging.pageIndex - 1) * this.paging.pageSize;
    const end = start + this.paging.pageSize;
    const slicedData = processedData.slice(start, end);

    this.mapData(slicedData);
  }

  private mapData(data: any[]): void {
    this.listOfData = data.map((item, index) => {
      return {
        ...item,
        index: (this.paging.pageIndex - 1) * this.paging.pageSize + index + 1,
        // Only allow actions if status is PENDING
        isActiveAction: item.status === 'PENDING'
      };
    });
  }

  onFilterInTable(event: NzTableQueryParams): void {
    const { pageIndex, pageSize } = event;
    if (this.paging.pageIndex !== pageIndex || this.paging.pageSize !== pageSize) {
        this.paging.pageIndex = pageIndex;
        this.paging.pageSize = pageSize;
        this.filterLocalData(); 
    }
  }

  getChangePagination(page: number): void {
    this.paging.pageIndex = page;
    this.filterLocalData();
  }

  onPageSizeChange(size: number): void {
    this.paging.pageSize = size;
    this.paging.pageIndex = 1;
    this.filterLocalData();
  }

  handleAction(actionKey: string, data: any): void {
    switch (actionKey) {
      case 'edit':
        this.openAddOverTimeModal(data.id, data);
        break;
      case 'delete':
        this.confirmDeleteOverTime(data);
        break;
      case 'approve':
        this.confirmApprove(data);
        break;
      case 'reject':
        this.openRejectModal(data);
        break;
      default:
        this.messageService.warning('Chức năng chưa hỗ trợ!');
    }
  }

  // Response (Approve/Reject) Logic
  isVisibleReject = false;
  rejectReason = '';
  selectedParticipantId: number | null = null;

  confirmApprove(data: any): void {
     // Ensure we have participantId
     // data.participantId should be available from flattening
     if (!data.participantId) {
         this.messageService.error('Không tìm thấy ID người tham gia!');
         return;
     }

     this.modalService.confirm({
      nzTitle: 'Xác nhận duyệt',
      nzContent: 'Bạn có chắc chắn muốn CHẤP THUẬN yêu cầu này?',
      nzOkText: 'Đồng ý',
      nzOkType: 'primary',
      nzOnOk: () => this.submitResponse(data.participantId, 'ACCEPTED')
    });
  }

  openRejectModal(data: any): void {
    if (!data.participantId) {
        this.messageService.error('Không tìm thấy ID người tham gia!');
        return;
    }
    this.selectedParticipantId = data.participantId;
    this.rejectReason = '';
    this.isVisibleReject = true;
  }

  handleCancelReject(): void {
      this.isVisibleReject = false;
      this.selectedParticipantId = null;
  }

  handleOkReject(): void {
      if (!this.rejectReason.trim()) {
          this.messageService.warning('Vui lòng nhập lý do từ chối');
          return;
      }
      if (this.selectedParticipantId) {
          this.submitResponse(this.selectedParticipantId, 'REJECTED', this.rejectReason);
      }
  }

  submitResponse(participantId: number | string, status: string, reason?: string): void {
      const body = {
          status: status,
          rejectReason: reason
      };
      
      this.overTimeManageService.respondToOtApi(participantId, body).subscribe(
          () => {
              this.messageService.success(status === 'ACCEPTED' ? 'Đã duyệt thành công!' : 'Đã từ chối thành công!');
              this.isVisibleReject = false; // Close reject modal if open
              this.fetchDataFromServer();
          },
          (error) => {
              this.messageService.error('Thao tác thất bại: ' + (error.error?.message || 'Lỗi hệ thống'));
          }
      );
  }

  confirmDeleteOverTime(data: any): void {
    this.modalService.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa đơn tăng ca này không?`,
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => this.deleteOverTime(data.id),
      nzCancelText: 'Hủy'
    });
  }

  deleteOverTime(id: number | string): void {
    this.overTimeManageService.deleteOverTimeApi(id).subscribe(
      () => {
        this.messageService.success('Xóa đơn tăng ca thành công!');
        this.fetchDataFromServer();
      },
      (error) => {
        this.messageService.error('Xóa đơn tăng ca thất bại: ' + (error.error?.message || 'Lỗi hệ thống'));
      }
    );
  }

  openAddOverTimeModal(id?: any, data?: any): void {
    const modalRef = this.modalService.create({
      nzTitle: undefined,
      nzContent: ModalAddOverTimeComponent,
      nzFooter: null,
      nzWidth: 600,
      nzComponentParams: {
         id: id,
         data: data
      }
    });
    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.fetchDataFromServer();
      }
    });
  }
}
