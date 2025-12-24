import { Component, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ModalLeaveComponent } from './modal-leave/modal-leave.component';
import { ModalAddLeaveComponent } from './modal-add-leave/modal-add-leave.component';
import { LeaveManagementService } from './leave-manage.service';
import { leaveManageColumns } from './leave-manage.columns';
import { StandardColumnModel } from '../../shares/interfaces';
import { RequestStatus } from '../../shares/enum/options.constants';
import { LeaveManageModel, LeaveSearchFilters, LeavePaging } from './leave-manage.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-leave-manage',
  templateUrl: './leave-manage.component.html',
  styleUrls: ['./leave-manage.component.scss']
})
export class LeaveManageComponent implements OnInit {
  // Constants
  private readonly LEAVE_TYPE_MAP: Record<string, string> = {
    'ANNUAL': 'Nghỉ phép năm',
    'SICK': 'Nghỉ ốm',
    'UNPAID': 'Nghỉ không lương',
    'MATERNITY': 'Nghỉ thai sản',
    'PATERNITY': 'Nghỉ chăm con',
    'OTHER': 'Khác'
  };

  private readonly STATUS_LABELS = RequestStatus.reduce((acc, status) => {
    acc[status.value] = status.label;
    return acc;
  }, {} as Record<string, string>);

  private readonly STATUS_COLORS = RequestStatus.reduce((acc, status) => {
    acc[status.label] = status.color;
    return acc;
  }, {} as Record<string, string>);

  // Data properties
  listOfData: LeaveManageModel[] = [];
  filteredData: LeaveManageModel[] = [];
  dataDeleteChecked: LeaveManageModel[] = [];
  loadingTable = false;
  isExporting = false;
  checked = false;
  indeterminate = false;
  canApproveLeave = true;
  isManager = false; // Check if user is manager
  isHR = false; // Check if user is HR (only HR can delete)
  isHROrAdmin = false; // Check if user is HR or Admin

  // Search filters for each column
  searchFilters: LeaveSearchFilters = {
    employeeUserName: '',
    employeeName: '',
    employeeEmail: '',
    departmentName: '',
    absenceTypeName: null,
    startDate: null,
    endDate: null,
    timeRegisterStart: '',
    timeRegisterEnd: '',
    absenceStatus: null,
    absenceReason: ''
  };

  paging: LeavePaging = {
    totalElements: 50,
    pageSize: 10,
    pageIndex: 1
  };

  leaveManageColumns: StandardColumnModel[] = leaveManageColumns();

  constructor(
    private modal: NzModalService,
    private leaveService: LeaveManagementService,
    private message: NzMessageService,
    private authService: AuthService
  ) {
  }

  // Expose constants for template
  get requestStatusOptions() {
    return RequestStatus;
  }

  get leaveTypeOptions() {
    return Object.entries(this.LEAVE_TYPE_MAP).map(([value, label]) => ({ value, label }));
  }

  ngOnInit(): void {
    // Check if user is manager
    this.isManager = this.authService.isManager();
    console.log('User is manager:', this.isManager);

    // Check if user is HR (only HR can delete)
    this.isHR = this.authService.isHR();
    console.log('User is HR:', this.isHR);

    // Check if user is HR or Admin
    this.isHROrAdmin = this.authService.isHROrAdmin();
    console.log('User is HR or Admin:', this.isHROrAdmin);

    this.loadLeaveData();
  }

  loadLeaveData(): void {
    this.loadingTable = true;
    const page = this.paging.pageIndex - 1;
    const size = this.paging.pageSize;

    console.log('loadLeaveData - isHROrAdmin:', this.isHROrAdmin, 'isManager:', this.isManager, 'page:', page, 'size:', size);

    // Choose API based on user role
    let apiCall;

    if (this.isHROrAdmin) {
      // HR/Admin can see all leave requests with filters
      const filters = this.buildFilterParams();
      apiCall = this.leaveService.getAllLeaveRequests({ page, size, ...filters });
      console.log('Calling getAllLeaveRequests API with filters:', filters);
    } else if (this.isManager) {
      // Manager can see department leave requests
      apiCall = this.leaveService.getLeaveByDepartment(page, size);
      console.log('Calling getLeaveByDepartment API');
    } else {
      // Regular employee can only see their own leave requests
      apiCall = this.leaveService.getLeaveMy(page, size);
      console.log('Calling getLeaveMy API');
    }

    apiCall.subscribe(
      (response) => {
        console.log('Leave data loaded:', response);

        // Handle different response formats
        const content = response?.content || (Array.isArray(response) ? response : []);

        if (content.length > 0) {
          this.listOfData = content.map((item: any) => this.mapApiItemToLeaveData(item));
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
        console.error('Error loading leave data:', error);
        this.message.error('Không thể tải dữ liệu nghỉ phép: ' + (error.error || error.message || 'Unknown error'));
        this.loadingTable = false;
        this.listOfData = [];
        this.filteredData = [];
        this.paging.totalElements = 0;
      }
    );
  }

  private buildFilterParams(): any {
    const filters: any = {};

    // Build filter params from search filters for HR/Admin
    if (this.searchFilters.employeeName) {
      filters.employeeName = this.searchFilters.employeeName;
    }

    if (this.searchFilters.departmentName) {
      filters.department = this.searchFilters.departmentName;
    }

    if (this.searchFilters.absenceStatus) {
      // Map display status to API status
      const statusEntry = RequestStatus.find(s => s.label === this.searchFilters.absenceStatus);
      if (statusEntry) {
        filters.status = statusEntry.value;
      }
    }

    if (this.searchFilters.absenceTypeName) {
      // Map display type to API type
      const typeEntry = Object.entries(this.LEAVE_TYPE_MAP).find(([_, label]) => label === this.searchFilters.absenceTypeName);
      if (typeEntry) {
        filters.type = typeEntry[0];
      }
    }

    return filters;
  }

  private mapApiItemToLeaveData(item: any): LeaveManageModel {
    return {
      id: item.id,
      employeeId: item.employeeId,
      employeeUserName: item.employeeCode || (item.employeeId ? `EMP${String(item.employeeId).padStart(3, '0')}` : 'N/A'),
      employeeName: item.employeeName || 'N/A',
      employeeEmail: item.employeeEmail || `emp${item.employeeId}@company.com`,
      departmentName: item.departmentName || 'N/A',
      type: item.type,
      absenceTypeName: this.mapLeaveType(item.type),
      startDate: item.startDate,
      endDate: item.endDate,
      timeRegisterStart: this.formatTimeDisplay(item.startDate),
      timeRegisterEnd: this.formatTimeDisplay(item.endDate),
      absenceStatus: this.mapLeaveStatus(item.status),
      absenceReason: item.reason || 'Không có lý do',
      checked: false
    };
  }

  mapLeaveType(type: string): string {
    return this.LEAVE_TYPE_MAP[type] || type || 'N/A';
  }

  mapLeaveStatus(status: string): string {
    return this.STATUS_LABELS[status] || status;
  }

  // Open modal to add new leave request
  openAddModal(): void {
    const modalRef = this.modal.create({
      nzTitle: undefined,
      nzContent: ModalAddLeaveComponent,
      nzFooter: null,
      nzWidth: 600,
      nzBodyStyle: {
        padding: '24px'
      }
    });

    // Handle modal close event
    modalRef.afterClose.subscribe((result) => {
      if (result && result.success) {
        this.loadLeaveData();
      }
    });
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
    if (!this.isHR) {
      this.message.warning('Chỉ HR mới có quyền xóa yêu cầu vắng mặt');
      return;
    }

    if (this.dataDeleteChecked.length === 0) {
      this.message.warning('Vui lòng chọn ít nhất một yêu cầu để xóa');
      return;
    }

    const selectedCount = this.dataDeleteChecked.length;
    const selectedIds: number[] = this.dataDeleteChecked
      .map(item => item.id)
      .filter((id): id is number => typeof id === 'number');

    if (selectedIds.length === 0) {
      this.message.error('Không tìm thấy ID của yêu cầu cần xóa');
      return;
    }

    // Show confirmation modal
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa ${selectedCount} yêu cầu vắng mặt đã chọn?<br/><strong>Hành động này không thể hoàn tác!</strong>`,
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.performDelete(selectedIds);
      }
    });
  }

  private performDelete(leaveIds: number[]): void {
    this.loadingTable = true;
    let successCount = 0;
    let errorCount = 0;

    console.log('🗑️ Performing delete for leave IDs:', leaveIds);
    console.log('🔍 Using service:', this.leaveService.constructor.name);

    // Delete each selected leave request
    const deleteRequests = leaveIds.map(id => {
      console.log(`🚀 Calling deleteLeaveRequest for ID: ${id}`);
      return this.leaveService.deleteLeaveRequest(id).toPromise()
        .then(() => {
          console.log(`✅ Successfully deleted leave ID: ${id}`);
          successCount++;
        })
        .catch((error) => {
          console.error(`❌ Error deleting leave request ${id}:`, error);
          console.error(`   URL attempted:`, error.url);
          errorCount++;
        });
    });

    Promise.all(deleteRequests).then(() => {
      this.loadingTable = false;

      if (successCount > 0) {
        this.message.success(`Đã xóa thành công ${successCount} yêu cầu vắng mặt`);
      }

      if (errorCount > 0) {
        this.message.error(`Không thể xóa ${errorCount} yêu cầu vắng mặt`);
      }

      // Clear selection and reload data
      this.dataDeleteChecked = [];
      this.loadLeaveData();
    });
  }

  onReject(): void {
    console.log('Rejecting selected items:', this.dataDeleteChecked);
    // Implement rejection logic here
  }

  onAccept(): void {
    console.log('Accepting selected items:', this.dataDeleteChecked);
    // Implement acceptance logic here
  }

  handleAction(actionKey: string, data: LeaveManageModel): void {
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

  exportFile(): void {
    this.isExporting = true;
    setTimeout(() => {
      console.log('Exporting file...');
      this.isExporting = false;
    }, 2000);
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

  onItemChecked(item: LeaveManageModel, checked: boolean): void {
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
    this.loadLeaveData();
  }

  onPageSizeChange(pageSize: number): void {
    this.paging.pageSize = pageSize;
    this.paging.pageIndex = 1;
    console.log('Page size changed to:', pageSize);
    this.loadLeaveData();
  }

  openDetailModal(data: LeaveManageModel): void {
    const modalRef = this.modal.create({
      nzTitle: undefined,
      nzContent: ModalLeaveComponent,
      nzFooter: null,
      nzWidth: 700,
      nzBodyStyle: {
        padding: '24px'
      }
    });

    // Convert data to modal format
    const modalData = {
      employeeUserName: data.employeeUserName,
      employeeName: data.employeeName,
      employeeEmail: data.employeeEmail || data.employeeUserName + '@company.com',
      organizationName: data.organizationName || 'N/A',
      absenceTypeName: data.absenceTypeName,
      startDate: new Date(data.startDate || ''),
      endDate: new Date(data.endDate || ''),
      absenceStatus: this.mapStatusToEnum(data.absenceStatus || ''),
      absenceReason: data.absenceReason,
      rejectReason: 'Không đủ số ngày phép'
    };

    // Pass data to modal component
    if (modalRef.componentInstance) {
      modalRef.componentInstance.itemData = modalData;
    }
  }

  mapStatusToEnum(status: string): string {
    const statusEntry = RequestStatus.find(s => s.label === status);
    return statusEntry?.value || 'WAITING_FOR_APPROVE';
  }

  getStatusColor(status: string): string {
    return this.STATUS_COLORS[status] || 'default';
  }

  onSearch(): void {
    // For HR/Admin, reload data from API with filters (server-side filtering)
    if (this.isHROrAdmin) {
      this.paging.pageIndex = 1;
      this.loadLeaveData();
      return;
    }

    // For Manager and Employee, use client-side filtering
    this.filteredData = this.listOfData.filter(item => {
      // Filter by employeeUserName
      if (this.searchFilters.employeeUserName &&
        !item.employeeUserName?.toLowerCase().includes(this.searchFilters.employeeUserName.toLowerCase())) {
        return false;
      }

      // Filter by employeeName
      if (this.searchFilters.employeeName &&
        !item.employeeName?.toLowerCase().includes(this.searchFilters.employeeName.toLowerCase())) {
        return false;
      }

      // Filter by employeeEmail
      if (this.searchFilters.employeeEmail &&
        !item.employeeEmail?.toLowerCase().includes(this.searchFilters.employeeEmail.toLowerCase())) {
        return false;
      }

      // Filter by organizationName
      if (this.searchFilters.departmentName &&
        !item.organizationName?.toLowerCase().includes(this.searchFilters.departmentName.toLowerCase())) {
        return false;
      }

      // Filter by absenceTypeName
      if (this.searchFilters.absenceTypeName && item.absenceTypeName !== this.searchFilters.absenceTypeName) {
        return false;
      }

      // Filter by absenceStatus
      if (this.searchFilters.absenceStatus && item.absenceStatus !== this.searchFilters.absenceStatus) {
        return false;
      }

      // Filter by startDate
      if (this.searchFilters.startDate) {
        const filterDate = this.formatDateForComparison(this.searchFilters.startDate);
        if (item.startDate !== filterDate) {
          return false;
        }
      }

      // Filter by endDate
      if (this.searchFilters.endDate) {
        const filterDate = this.formatDateForComparison(this.searchFilters.endDate);
        if (item.endDate !== filterDate) {
          return false;
        }
      }

      // Filter by timeRegisterStart
      if (this.searchFilters.timeRegisterStart &&
        !item.timeRegisterStart?.toLowerCase().includes(this.searchFilters.timeRegisterStart.toLowerCase())) {
        return false;
      }

      // Filter by timeRegisterEnd
      if (this.searchFilters.timeRegisterEnd &&
        !item.timeRegisterEnd?.toLowerCase().includes(this.searchFilters.timeRegisterEnd.toLowerCase())) {
        return false;
      }

      // Filter by absenceReason
      if (this.searchFilters.absenceReason &&
        !item.absenceReason?.toLowerCase().includes(this.searchFilters.absenceReason.toLowerCase())) {
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
      absenceTypeName: null,
      startDate: null,
      endDate: null,
      timeRegisterStart: '',
      timeRegisterEnd: '',
      absenceStatus: null,
      absenceReason: ''
    };

    // For HR/Admin, reload data from API without filters
    if (this.isHROrAdmin) {
      this.paging.pageIndex = 1;
      this.loadLeaveData();
      return;
    }

    // For Manager and Employee, reset client-side filtering
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

  formatTimeDisplay(dateString: string): string {
    if (!dateString) return '--:--';
    // If the date string contains time info, extract it
    // Otherwise return default time
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '--:--';

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}

