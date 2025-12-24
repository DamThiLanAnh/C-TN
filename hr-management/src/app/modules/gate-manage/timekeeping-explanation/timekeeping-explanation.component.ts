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

@Component({
  selector: 'app-timekeeping-explanation',
  templateUrl: './timekeeping-explanation.component.html',
  styleUrls: ['./timekeeping-explanation.component.scss']
})
export class TimekeepingExplanationComponent implements OnInit {
  // Constants
  private readonly STATUS_LABELS = RequestStatus.reduce((acc, status) => {
    acc[status.value] = status.label;
    return acc;
  }, {} as Record<string, string>);

  private readonly STATUS_COLORS = RequestStatus.reduce((acc, status) => {
    acc[status.label] = status.color;
    return acc;
  }, {} as Record<string, string>);

  // Data properties
  listOfData: TimekeepingExplanationModel[] = [];
  filteredData: TimekeepingExplanationModel[] = [];
  dataDeleteChecked: TimekeepingExplanationModel[] = [];
  loadingTable = false;
  checked = false;
  indeterminate = false;
  canApprove = true;
  isManager = false;
  isHROrAdmin = false;

  // Date range for picker
  dateRange: Date[] | null = null;

  // Search filters
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
  ) {}

  // Expose constants for template
  get requestStatusOptions() {
    return RequestStatus;
  }

  ngOnInit(): void {
    this.isManager = this.authService.isManager();
    this.isHROrAdmin = this.authService.isHROrAdmin();
    console.log('User is manager:', this.isManager);
    console.log('User is HR or Admin:', this.isHROrAdmin);

    this.loadData();
  }

  loadData(): void {
    this.loadingTable = true;
    const page = this.paging.pageIndex - 1;
    const size = this.paging.pageSize;

    let apiCall;

    if (this.isHROrAdmin || this.isManager) {
      // Both HR/Admin and Manager use same API with filters
      const filters = this.buildFilterParams();
      if (this.isHROrAdmin) {
        apiCall = this.service.getAllTimekeepingExplanations({ page, size, ...filters });
        console.log('HR/Admin calling getAllTimekeepingExplanations API with filters:', filters);
      } else {
        apiCall = this.service.getTimekeepingByDepartment({ page, size, ...filters });
        console.log('Manager calling getTimekeepingByDepartment API with filters:', filters);
      }
    } else {
      apiCall = this.service.getTimekeepingMy(page, size);
      console.log('Employee calling getTimekeepingMy API');
    }

    apiCall.subscribe(
      (response) => {
        console.log('Timekeeping explanation data loaded:', response);

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

    // Employee code filter
    if (this.searchFilters.employeeUserName) {
      filters.employeeCode = this.searchFilters.employeeUserName;
    }

    // Department filter
    if (this.searchFilters.departmentName) {
      filters.department = this.searchFilters.departmentName;
    }

    // Date range filters
    if (this.searchFilters.fromDate) {
      filters.fromDate = this.formatDateForAPI(this.searchFilters.fromDate);
    }

    if (this.searchFilters.toDate) {
      filters.toDate = this.formatDateForAPI(this.searchFilters.toDate);
    }

    // Status filter
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
      checkInTime: item.checkInTime || '--:--',
      checkOutTime: item.checkOutTime || '--:--',
      proposedCheckIn: item.proposedCheckIn || '--:--',
      proposedCheckOut: item.proposedCheckOut || '--:--',
      reason: item.reason || 'Không có lý do',
      status: this.mapStatus(item.status),
      approvalDate: item.approvalDate,
      approverName: item.approverName,
      rejectReason: item.rejectReason,
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
        console.log('Timekeeping explanation created successfully:', result);
        this.loadData(); // Reload data after creating
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
    if (!this.isHROrAdmin) {
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

    const selectedIds: number[] = this.dataDeleteChecked
      .map(item => item.id)
      .filter((id): id is number => typeof id === 'number');

    this.modal.confirm({
      nzTitle: 'Xác nhận từ chối',
      nzContent: `Bạn có chắc chắn muốn từ chối ${selectedIds.length} giải trình công đã chọn?`,
      nzOkText: 'Từ chối',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.performReject(selectedIds);
      }
    });
  }

  private performReject(ids: number[]): void {
    this.loadingTable = true;
    let successCount = 0;
    let errorCount = 0;

    const rejectRequests = ids.map(id =>
      this.service.rejectTimekeepingExplanation(id).toPromise()
        .then(() => {
          successCount++;
        })
        .catch((error) => {
          console.error(`Error rejecting timekeeping explanation ${id}:`, error);
          errorCount++;
        })
    );

    Promise.all(rejectRequests).then(() => {
      this.loadingTable = false;

      if (successCount > 0) {
        this.message.success(`Đã từ chối thành công ${successCount} giải trình công`);
      }

      if (errorCount > 0) {
        this.message.error(`Không thể từ chối ${errorCount} giải trình công`);
      }

      this.dataDeleteChecked = [];
      this.loadData();
    });
  }

  onAccept(): void {
    if (this.dataDeleteChecked.length === 0) {
      this.message.warning('Vui lòng chọn ít nhất một giải trình để duyệt');
      return;
    }

    const selectedIds: number[] = this.dataDeleteChecked
      .map(item => item.id)
      .filter((id): id is number => typeof id === 'number');

    this.modal.confirm({
      nzTitle: 'Xác nhận duyệt',
      nzContent: `Bạn có chắc chắn muốn duyệt ${selectedIds.length} giải trình công đã chọn?`,
      nzOkText: 'Duyệt',
      nzOkType: 'primary',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.performApprove(selectedIds);
      }
    });
  }

  private performApprove(ids: number[]): void {
    this.loadingTable = true;
    let successCount = 0;
    let errorCount = 0;

    const approveRequests = ids.map(id =>
      this.service.approveTimekeepingExplanation(id).toPromise()
        .then(() => {
          successCount++;
        })
        .catch((error) => {
          console.error(`Error approving timekeeping explanation ${id}:`, error);
          errorCount++;
        })
    );

    Promise.all(approveRequests).then(() => {
      this.loadingTable = false;

      if (successCount > 0) {
        this.message.success(`Đã duyệt thành công ${successCount} giải trình công`);
      }

      if (errorCount > 0) {
        this.message.error(`Không thể duyệt ${errorCount} giải trình công`);
      }

      this.dataDeleteChecked = [];
      this.loadData();
    });
  }

  handleAction(actionKey: string, data: TimekeepingExplanationModel): void {
    console.log(`Action ${actionKey} triggered for:`, data);
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
    console.log('Table query params changed:', params);
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
    console.log('Page changed to:', pageIndex);
    this.loadData();
  }

  onPageSizeChange(pageSize: number): void {
    this.paging.pageSize = pageSize;
    this.paging.pageIndex = 1;
    console.log('Page size changed to:', pageSize);
    this.loadData();
  }

  openDetailModal(data: TimekeepingExplanationModel): void {
    console.log('Opening detail modal for:', data);

    const modal = this.modal.create({
      nzTitle: 'Chi tiết giải trình công',
      nzContent: ModalTimekeepingDetailComponent,
      nzFooter: null,
      nzWidth: 700,
      nzMaskClosable: false,
      nzComponentParams: {
        itemData: data
      }
    });

    modal.afterClose.subscribe((result) => {
      if (result && (result.action === 'accept' || result.action === 'reject')) {
        console.log('Modal closed with action:', result);
        this.loadData(); // Reload data after approve/reject
      }
    });
  }

  onSearch(): void {
    // For HR/Admin and Manager, reload data from API with filters (server-side filtering)
    if (this.isHROrAdmin || this.isManager) {
      this.paging.pageIndex = 1;
      this.loadData();
      return;
    }

    // For Employee, use client-side filtering
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

    if (this.isHROrAdmin || this.isManager) {
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


