import { Component, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TimekeepingExplanationService } from './timekeeping-explanation.service';
import { timekeepingExplanationColumns } from './timekeeping-explanation.columns';
import { StandardColumnModel } from '../../shares/interfaces';
import { RequestStatus } from '../../shares/enum/options.constants';
import {
  TimekeepingExplanationModel,
  TimekeepingExplanationFilters,
  TimekeepingExplanationPaging
} from './timekeeping-explanation.model';
import { AuthService } from '../../../services/auth.service';
import { ModalAddTimekeepingComponent } from './modal-add-timekeeping/modal-add-timekeeping.component';
import { ModalTimekeepingDetailComponent } from './modal-timekeeping-detail/modal-timekeeping-detail.component';
import { ConfirmModalComponent } from '../../shares/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-timekeeping-explanation',
  templateUrl: './timekeeping-explanation.component.html',
  styleUrls: ['./timekeeping-explanation.component.scss']
})
export class TimekeepingExplanationComponent implements OnInit {
  // Hang so
  private readonly STATUS_LABELS = RequestStatus.reduce((acc, status) => {
    acc[status.value] = status.label;
    return acc;
  }, {} as Record<string, string>);

  private readonly STATUS_COLORS = RequestStatus.reduce((acc, status) => {
    acc[status.label] = status.color;
    return acc;
  }, {} as Record<string, string>);

  // Du lieu
  listOfData: TimekeepingExplanationModel[] = [];
  filteredData: TimekeepingExplanationModel[] = [];
  dataDeleteChecked: TimekeepingExplanationModel[] = [];
  loadingTable = false;
  checked = false;
  indeterminate = false;
  canApprove = true;

  // Khoang thoi gian
  dateRange: Date[] | null = null;

  // Bo loc tim kiem
  searchFilters: TimekeepingExplanationFilters = {
    employeeUserName: '',
    employeeName: '',
    employeeEmail: '',
    departmentName: '',
    fromDate: null,
    toDate: null,
    status: null,
    reason: ''
  };

  paging: TimekeepingExplanationPaging = {
    totalElements: 0,
    pageSize: 10,
    pageIndex: 1
  };

  timekeepingColumns: StandardColumnModel[] = timekeepingExplanationColumns();

  constructor(
    private modal: NzModalService,
    private service: TimekeepingExplanationService,
    private message: NzMessageService,
    private authService: AuthService
  ) { }

  // Hang so template
  get requestStatusOptions() {
    return RequestStatus;
  }

  ngOnInit(): void {
    // Set canApprove based on role/auth service
    this.canApprove = this.authService.canApprove();

    // Loc cot: Xoa cot 'action' cho Nhan vien (nguoi khong the duyet)
    if (!this.canApprove) {
      this.timekeepingColumns = this.timekeepingColumns.filter(col => col.name !== 'action');
    }

    this.loadData();
  }

  loadData(): void {
    this.loadingTable = true;
    const page = this.paging.pageIndex - 1;
    const size = this.paging.pageSize;

    let apiCall;

    if (this.canApprove) {
      // Ca HR/Admin va Manager su dung cung API voi bo loc
      const filters = this.buildFilterParams();
      apiCall = this.service.getPendingTimekeepingExplanationsApi({ page, size, ...filters });
    } else {
      apiCall = this.service.getTimekeepingMy(page, size);
    }

    apiCall.subscribe(
      (response) => {

        const content = response?.content || (Array.isArray(response) ? response : []);

        if (content.length > 0) {
          this.listOfData = content.map((item: any) => this.mapApiItemToData(item));
          this.filteredData = [...this.listOfData];
          this.paging.totalElements = response?.totalElements || this.listOfData.length;
        } else {
          this.listOfData = [];
          this.filteredData = [];
          this.paging.totalElements = 0;
        }

        this.loadingTable = false;
      },
      (error) => {
        console.error('Error loading timekeeping explanation data:', error);
        this.message.error('Không thể tải dữ liệu giải trình công');
        this.loadingTable = false;
        this.listOfData = [];
        this.filteredData = [];
        this.paging.totalElements = 0;
      }
    );
  }

  private buildFilterParams(): any {
    const filters: any = {};

    // Loc theo ma nhan vien
    if (this.searchFilters.employeeUserName) {
      filters.employeeCode = this.searchFilters.employeeUserName;
    }

    // Loc theo phong ban
    if (this.searchFilters.departmentName) {
      filters.department = this.searchFilters.departmentName;
    }

    // Loc theo khoang thoi gian
    if (this.searchFilters.fromDate) {
      filters.fromDate = this.formatDateForAPI(this.searchFilters.fromDate);
    }

    if (this.searchFilters.toDate) {
      filters.toDate = this.formatDateForAPI(this.searchFilters.toDate);
    }

    // Loc theo trang thai
    if (this.searchFilters.status) {
      const statusEntry = RequestStatus.find(s => s.label === this.searchFilters.status);
      if (statusEntry) {
        filters.status = statusEntry.value;
      }
    }

    return filters;
  }

  private formatDateForAPI(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private mapApiItemToData(item: any): TimekeepingExplanationModel {
    return {
      id: item.id,
      employeeId: item.employeeId,
      employeeUserName: item.employeeCode || `EMP${String(item.employeeId).padStart(3, '0')}`,
      employeeName: item.employeeName || 'N/A',
      employeeEmail: item.employeeEmail || `emp${item.employeeId}@company.com`,
      departmentName: item.departmentName || 'N/A',
      workDate: item.workDate,
      checkInTime: item.originalCheckIn || '--:--',
      checkOutTime: item.originalCheckOut || '--:--',
      proposedCheckIn: item.proposedCheckIn || '--:--',
      proposedCheckOut: item.proposedCheckOut || '--:--',
      reason: item.reason || 'Không có lý do',
      status: this.mapStatus(item.status),
      approvalDate: item.decidedAt,
      approverName: item.decidedBy,
      rejectReason: item.managerNote,
      checked: false
    };
  }

  mapStatus(status: string): string {
    return this.STATUS_LABELS[status] || status;
  }

  getStatusColor(status: string): string {
    return this.STATUS_COLORS[status] || 'default';
  }

  openAddModal(): void {
    const modal = this.modal.create({
      nzTitle: 'Thêm mới giải trình công',
      nzContent: ModalAddTimekeepingComponent,
      nzFooter: null,
      nzWidth: 600,
      nzMaskClosable: false
    });

    modal.afterClose.subscribe((result) => {
      if (result && result.success) {
        this.loadData(); // Tai lai du lieu sau khi tao
      }
    });
  }

  onDateRangeChange(dates: Date[] | null): void {
    if (dates && dates.length === 2) {
      this.searchFilters.fromDate = dates[0];
      this.searchFilters.toDate = dates[1];
    } else {
      this.searchFilters.fromDate = null;
      this.searchFilters.toDate = null;
    }
    this.onSearch();
  }

  isDataSelected(): boolean {
    return this.dataDeleteChecked.length > 0;
  }

  onChangeUnselectData(): void {
    this.dataDeleteChecked = [];
    this.listOfData.forEach(item => item.checked = false);
    this.updateCheckAllStatus();
  }

  onDelete(): void {
    if (!this.canApprove) {
      this.message.warning('Bạn không có quyền xóa giải trình công');
      return;
    }

    if (this.dataDeleteChecked.length === 0) {
      this.message.warning('Vui lòng chọn ít nhất một giải trình để xóa');
      return;
    }

    const selectedCount = this.dataDeleteChecked.length;
    const selectedIds: number[] = this.dataDeleteChecked
      .map(item => item.id)
      .filter((id): id is number => typeof id === 'number');

    if (selectedIds.length === 0) {
      this.message.error('Không tìm thấy ID của giải trình cần xóa');
      return;
    }

    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa ${selectedCount} giải trình công đã chọn?<br/><strong>Hành động này không thể hoàn tác!</strong>`,
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.performDelete(selectedIds);
      }
    });
  }

  private performDelete(ids: number[]): void {
    this.loadingTable = true;
    let successCount = 0;
    let errorCount = 0;

    const deleteRequests = ids.map(id =>
      this.service.deleteTimekeepingExplanation(id).toPromise()
        .then(() => {
          successCount++;
        })
        .catch((error) => {
          console.error(`Error deleting timekeeping explanation ${id}:`, error);
          errorCount++;
        })
    );

    Promise.all(deleteRequests).then(() => {
      this.loadingTable = false;

      if (successCount > 0) {
        this.message.success(`Đã xóa thành công ${successCount} giải trình công`);
      }

      if (errorCount > 0) {
        this.message.error(`Không thể xóa ${errorCount} giải trình công`);
      }

      this.dataDeleteChecked = [];
      this.loadData();
    });
  }

  onReject(): void {
    if (this.dataDeleteChecked.length === 0) {
      this.message.warning('Vui lòng chọn ít nhất một giải trình để từ chối');
      return;
    }

    const modal = this.modal.create({
      nzContent: ConfirmModalComponent,
      nzFooter: null,
      nzClassName: 'custom-confirm-modal',
      nzComponentParams: {
        type: 'reject',
        title: 'Xác nhận từ chối',
        content: `Bạn có chắc chắn muốn từ chối ${this.dataDeleteChecked.length} giải trình công đã chọn?`,
        requireReason: true
      }
    });

    modal.afterClose.subscribe((result) => {
      if (result && result.success) {
        this.processDecision('REJECT', result.reason);
      }
    });
  }



  onAccept(): void {
    if (this.dataDeleteChecked.length === 0) {
      this.message.warning('Vui lòng chọn ít nhất một giải trình để duyệt');
      return;
    }

    const modal = this.modal.create({
      nzContent: ConfirmModalComponent,
      nzFooter: null,
      nzClassName: 'custom-confirm-modal',
      nzComponentParams: {
        type: 'approve',
        title: 'Xác nhận duyệt',
        content: `Bạn có chắc chắn muốn duyệt ${this.dataDeleteChecked.length} giải trình công đã chọn?`
      }
    });

    modal.afterClose.subscribe((result) => {
      if (result && result.success) {
        this.processDecision('APPROVE', result.reason);
      }
    });
  }

  private processDecision(action: 'APPROVE' | 'REJECT', reason?: string): void {
    const selectedIds: number[] = this.dataDeleteChecked
      .map(item => item.id)
      .filter((id): id is number => typeof id === 'number');

    if (selectedIds.length === 0) {
      this.message.warning('Không tìm thấy ID hợp lệ để xử lý.');
      return;
    }

    this.loadingTable = true;
    const body = {
      ids: selectedIds,
      action: action,
      managerNote: reason || ''
    };

    this.service.bulkDecisionTimekeepingExplanationApi(body).subscribe(
      (res: any) => {
        this.loadingTable = false;

        // Handle response with success and failed arrays
        const successCount = res.success ? res.success.length : 0;
        const failedCount = res.failed ? res.failed.length : 0;

        if (successCount > 0) {
          this.message.success(`Đã ${action === 'APPROVE' ? 'duyệt' : 'từ chối'} thành công ${successCount} giải trình công`);
        }

        if (failedCount > 0) {
          this.message.error(`Không thể ${action === 'APPROVE' ? 'duyệt' : 'từ chối'} ${failedCount} giải trình công (ID: ${res.failed.join(', ')})`);
        }

        if (successCount === 0 && failedCount === 0) {
          // Fallback if response format is different or empty
          this.message.success(`Đã ${action === 'APPROVE' ? 'duyệt' : 'từ chối'} thành công yêu cầu`);
        }

        this.dataDeleteChecked = [];
        this.loadData();
      },
      (err) => {
        console.error(`Error processing timekeeping explanation:`, err);
        this.loadingTable = false;
        const errorMessage = err.error?.message || err.error || err.message || 'Lỗi không xác định';
        this.message.error(`Lỗi xử lý yêu cầu: ${errorMessage}`);
      }
    );
  }

  handleAction(actionKey: string, data: TimekeepingExplanationModel): void {
    if (actionKey === 'approve') {
      data.checked = true;
      this.dataDeleteChecked = [data];
      this.onAccept();
    } else if (actionKey === 'reject') {
      data.checked = true;
      this.dataDeleteChecked = [data];
      this.onReject();
    }
  }

  onTableQueryParamsChange(params: any): void {
  }

  onChangeSelectAll(checked: boolean): void {
    this.checked = checked;
    this.listOfData.forEach(item => {
      item.checked = checked;
    });
    this.updateSelectedData();
  }

  onItemChecked(item: TimekeepingExplanationModel, checked: boolean): void {
    item.checked = checked;
    this.updateSelectedData();
    this.updateCheckAllStatus();
  }

  updateSelectedData(): void {
    this.dataDeleteChecked = this.listOfData.filter(item => item.checked);
  }

  updateCheckAllStatus(): void {
    const checkedCount = this.listOfData.filter(item => item.checked).length;
    this.checked = checkedCount === this.listOfData.length;
    this.indeterminate = checkedCount > 0 && checkedCount < this.listOfData.length;
  }

  getChangePagination(pageIndex: number): void {
    this.paging.pageIndex = pageIndex;
    this.loadData();
  }

  onPageSizeChange(pageSize: number): void {
    this.paging.pageSize = pageSize;
    this.paging.pageIndex = 1;
    this.loadData();
  }

  openDetailModal(data: TimekeepingExplanationModel): void {

    const modal = this.modal.create({
      nzTitle: 'Chi tiết giải trình công',
      nzContent: ModalTimekeepingDetailComponent,
      nzFooter: null,
      nzWidth: 700,
      nzMaskClosable: false,
      nzComponentParams: {
        itemData: data,
        canApprove: this.canApprove
      }
    });

    modal.afterClose.subscribe((result) => {
      if (result && (result.action === 'accept' || result.action === 'reject')) {
        this.loadData(); // Tai lai du lieu sau khi duyet/tu choi
      }
    });
  }

  onSearch(): void {
    // Voi HR/Admin va Manager, tai lai du lieu tu API voi bo loc (loc server-side)
    if (this.canApprove) {
      this.paging.pageIndex = 1;
      this.loadData();
      return;
    }

    // Voi Nhan vien, su dung loc client-side
    this.filteredData = this.listOfData.filter(item => {
      if (this.searchFilters.employeeUserName &&
        !item.employeeUserName?.toLowerCase().includes(this.searchFilters.employeeUserName.toLowerCase())) {
        return false;
      }

      if (this.searchFilters.employeeName &&
        !item.employeeName?.toLowerCase().includes(this.searchFilters.employeeName.toLowerCase())) {
        return false;
      }

      if (this.searchFilters.employeeEmail &&
        !item.employeeEmail?.toLowerCase().includes(this.searchFilters.employeeEmail.toLowerCase())) {
        return false;
      }

      if (this.searchFilters.departmentName &&
        !item.departmentName?.toLowerCase().includes(this.searchFilters.departmentName.toLowerCase())) {
        return false;
      }

      if (this.searchFilters.status && item.status !== this.searchFilters.status) {
        return false;
      }

      if (this.searchFilters.fromDate) {
        const filterDate = this.formatDateForComparison(this.searchFilters.fromDate);
        if (item.workDate && item.workDate < filterDate) {
          return false;
        }
      }

      if (this.searchFilters.toDate) {
        const filterDate = this.formatDateForComparison(this.searchFilters.toDate);
        if (item.workDate && item.workDate > filterDate) {
          return false;
        }
      }

      if (this.searchFilters.reason &&
        !item.reason?.toLowerCase().includes(this.searchFilters.reason.toLowerCase())) {
        return false;
      }

      return true;
    });

    this.paging.totalElements = this.filteredData.length;
    this.paging.pageIndex = 1;
  }

  onResetFilters(): void {
    this.searchFilters = {
      employeeUserName: '',
      employeeName: '',
      employeeEmail: '',
      departmentName: '',
      fromDate: null,
      toDate: null,
      status: null,
      reason: ''
    };

    // Reset date range picker
    this.dateRange = null;

    if (this.canApprove) {
      this.paging.pageIndex = 1;
      this.loadData();
      return;
    }

    this.filteredData = [...this.listOfData];
    this.paging.totalElements = this.filteredData.length;
    this.paging.pageIndex = 1;
  }

  formatDateForComparison(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
