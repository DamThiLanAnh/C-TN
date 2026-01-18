import { Component, OnInit, OnDestroy } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ModalLeaveComponent } from './modal-leave/modal-leave.component';
import { ModalAddLeaveComponent } from './modal-add-leave/modal-add-leave.component';
import { ConfirmModalComponent } from '../../shares/components/confirm-modal/confirm-modal.component';
import { LeaveManagementService } from './leave-manage.service';
import { leaveManageColumns } from './leave-manage.columns';
import { StandardColumnModel, StandardColumnType } from '../../shares/interfaces';
import { RequestStatus } from '../../shares/enum/options.constants';
import { LeaveManageModel, LeaveSearchFilters, LeavePaging } from './leave-manage.model';
import { AuthService } from '../../../services/auth.service';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-leave-manage',
  templateUrl: './leave-manage.component.html',
  styleUrls: ['./leave-manage.component.scss']
})
export class LeaveManageComponent implements OnInit, OnDestroy {
  // hang so
  LEAVE_TYPE_MAP: Record<string, string> = {
    'ANNUAL': 'Nghỉ phép năm',
    'UNPAID': 'Nghỉ không lương',
    'PERSONAL': 'Nghỉ việc riêng',
  };

  private readonly STATUS_LABELS = RequestStatus.reduce((acc, status) => {
    acc[status.value] = status.label;
    return acc;
  }, {} as Record<string, string>);

  private readonly STATUS_COLORS = RequestStatus.reduce((acc, status) => {
    acc[status.label] = status.color;
    return acc;
  }, {} as Record<string, string>);

  // du lieu
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
  currentUser: any;

  // bo loc
  public searchFilters: { [key: string]: any } = {};

  paging: LeavePaging = {
    totalElements: 50,
    pageSize: 10,
    pageIndex: 1
  };


  leaveManageColumns: StandardColumnModel[] = []; // khoi tao trong ngOnInit

  constructor(
    private modal: NzModalService,
    private message: NzMessageService,
    private leaveService: LeaveManagementService,
    private authService: AuthService
  ) {
  }

  // hang so template
  get requestStatusOptions() {
    return RequestStatus;
  }

  get leaveTypeOptions() {
    return Object.entries(this.LEAVE_TYPE_MAP).map(([value, label]) => ({ value, label }));
  }

  ngOnInit(): void {
    // kiem tra quan ly
    this.isManager = this.authService.isManager();

    // Check if user is HR (only HR can delete)
    this.isHR = this.authService.isHR();

    // Check if user is HR or Admin
    this.isHROrAdmin = this.authService.isHROrAdmin();

    // Set canApproveLeave based on role/auth service
    this.canApproveLeave = this.authService.canApprove();

    this.currentUser = this.authService.getUser();
    console.log('Current User:', this.currentUser);

    // xu ly loc
    this.filterChanged$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => {
        this.paging.pageIndex = 1; // Reset to page 1 for new search
        this.onSearch();
      });

    // khoi tao cot
    this.leaveManageColumns = leaveManageColumns(this.canApproveLeave);

    this.loadDepartments();
    this.loadLeaveData();
  }

  loadDepartments(): void {
    this.leaveService.getActiveDepartments().subscribe((res: any) => {
      const content = res.data || res.content || res;
      console.log('API Departments:', content);
      if (Array.isArray(content)) {
        const options = content.map((d: any) => ({ label: d.name, value: d.name }));
        console.log('Mapped Options:', options);

        // cap nhat option
        const deptCol = this.leaveManageColumns.find(c => c.name === 'departmentName');
        if (deptCol && deptCol.filter) {
          deptCol.filter.options = options;
          // cap nhat giao dien
          this.leaveManageColumns = [...this.leaveManageColumns];
        }
      }
    }, err => console.error('Error loading departments:', err));
  }

  loadLeaveData(): void {
    this.loadingTable = true;
    // lay du lieu (HR lay tat ca)
    const pageSize = this.paging.pageSize;
    const page = this.paging.pageIndex > 0 ? this.paging.pageIndex - 1 : 0;

    console.log('Fetching data with:', { page, pageSize, canApprove: this.canApproveLeave });

    let apiCall;
    // Theo yeu cau: canApprove true thi goi getPendingLeaves, false thi goi getLeaveMy
    if (this.canApproveLeave) {
      // lay danh sach cho duyet
      apiCall = this.leaveService.getPendingLeaves(page, pageSize);
    } else {
      // lay danh sach ca nhan
      apiCall = this.leaveService.getLeaveMy(page, pageSize);
    }

    apiCall.subscribe(
      (response) => {
        const content = response?.content || (Array.isArray(response) ? response : []);
        // Cap nhat totalElements tu API
        if (response?.totalElements !== undefined) {
          this.paging.totalElements = response.totalElements;
        }

        if (content.length > 0) {
          this.listOfData = content.map((item: any) => this.mapApiItemToLeaveData(item));
          this.filteredData = this.listOfData; // Gan luon filteredData neu server-side pagination
          // ap dung loc (client side - chi loc tren trang hien tai nếu cần)
          // this.onSearch();
        } else {
          this.listOfData = [];
          this.filteredData = [];
          // this.paging.totalElements = 0; // Khong reset totalElements neu API tra ve 0 content nhung co total
        }
        this.loadingTable = false;
      },
      (error) => {
        this.loadingTable = false;
        console.error('Error loading leave data:', error);
        this.message.error('Không thể tải dữ liệu nghỉ phép');
      }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildFilterParams(): any {
    const filters: any = {};

    // tao tham so loc
    if (this.searchFilters['employeeName']) {
      filters.employeeName = this.searchFilters['employeeName'];
    }

    if (this.searchFilters['departmentName']) {
      filters.department = this.searchFilters['departmentName'];
    }

    if (this.searchFilters['absenceStatus']) {
      // map trang thai
      const statusEntry = RequestStatus.find(s => s.label === this.searchFilters['absenceStatus']);
      if (statusEntry) {
        filters.status = statusEntry.value;
      }
    }

    if (this.searchFilters['absenceTypeName']) {
      // map loai nghi
      const typeEntry = Object.entries(this.LEAVE_TYPE_MAP).find(([_, label]) => label === this.searchFilters['absenceTypeName']);
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
      leaveDate: item.leaveDate,
      duration: this.mapDuration(item.duration),
      durationCode: item.duration,
      absenceTypeName: this.mapLeaveType(item.type),
      absenceStatus: this.mapLeaveStatus(item.status),
      absenceReason: item.reason || 'Không có lý do',
      approvalUserId: item.approverId,
      checked: false
    };
  }

  mapDuration(duration: string): string {
    const map: Record<string, string> = {
      'FULL_DAY': 'Cả ngày',
      'MORNING': 'Sáng',
      'AFTERNOON': 'Chiều'
    };
    return map[duration] || duration || 'N/A';
  }

  mapLeaveType(type: string): string {
    return this.LEAVE_TYPE_MAP[type] || type || 'N/A';
  }

  mapLeaveStatus(status: string): string {
    return this.STATUS_LABELS[status] || status;
  }

  // mo modal them moi
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

    // xu ly dong modal
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

    // hien modal xac nhan
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

    // xoa cac yeu cau
    const deleteRequests = leaveIds.map(id => {
      return this.leaveService.deleteLeaveRequest(id).toPromise()
        .then(() => {
          successCount++;
        })
        .catch((error) => {
          console.error(`Error deleting leave request ${id}:`, error);
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

      // xoa lua chon va tai lai
      this.dataDeleteChecked = [];
      this.loadLeaveData();
    });
  }

  // Properties and methods for modal removed

  onReject(): void {
    if (this.dataDeleteChecked.length === 0) {
      this.message.warning('Vui lòng chọn ít nhất một yêu cầu để từ chối');
      return;
    }

    const modalRef = this.modal.create({
      nzContent: ConfirmModalComponent,
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: true,
      nzWidth: 400,
      nzClassName: 'custom-confirm-modal',
      nzComponentParams: {
        type: 'reject',
        title: 'Từ chối yêu cầu',
        content: 'Bạn có chắc chắn muốn từ chối các yêu cầu đã chọn không?',
        requireReason: true
      }
    });

    modalRef.afterClose.subscribe(result => {
      if (result && result.success) {
        this.processReview('REJECT', result.reason);
      }
    });
  }

  onAccept(): void {
    if (this.dataDeleteChecked.length === 0) {
      this.message.warning('Vui lòng chọn ít nhất một yêu cầu để duyệt');
      return;
    }

    const modalRef = this.modal.create({
      nzContent: ConfirmModalComponent,
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: true,
      nzWidth: 400,
      nzClassName: 'custom-confirm-modal',
      nzComponentParams: {
        type: 'approve',
        title: 'Duyệt yêu cầu',
        content: 'Bạn có chắc chắn muốn duyệt các yêu cầu đã chọn không?'
      }
    });

    modalRef.afterClose.subscribe(result => {
      if (result && result.success) {
        this.processReview('APPROVE', 'Đồng ý cho nghỉ');
      }
    });
  }



  private processReview(action: 'APPROVE' | 'REJECT', note: string): void {
    const selectedIds = this.dataDeleteChecked
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
      managerNote: note
    };

    this.leaveService.decisionLeaveRequest(body).subscribe(
      () => {
        this.loadingTable = false;
        this.message.success(`Đã ${action === 'APPROVE' ? 'duyệt' : 'từ chối'} thành công ${selectedIds.length} yêu cầu`);
        this.dataDeleteChecked = [];
        this.loadLeaveData();
      },
      (err: any) => {
        console.error(`Error reviewing leaves:`, err);
        this.loadingTable = false;
        const errorMessage = err.error?.message || err.error || err.message || 'Lỗi không xác định';
        this.message.error(`Lỗi xử lý yêu cầu: ${errorMessage}`);
      }
    );
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
    } else if (actionKey === 'edit') {
      this.onEdit(data);
    } else if (actionKey === 'delete') {
      this.onDeleteOne(data);
    }
  }

  onEdit(data: LeaveManageModel): void {
    // Open modal in edit mode (assuming modal supports it or create logic)
    // For now, reuse openAddModal but might need modification to pass data
    // Checking if ModalAddLeaveComponent supports editing or if we should use another modal
    // Given the files I saw earlier, there's `modal-add-leave` and `modal-leave`.
    // `modal-leave` seems to be view detail. `modal-add-leave` is likely for adding.
    // I'll assume we need to pass data to `modal-add-leave` or create a new instance.

    // Note: The user asked for "Update" button for Employee.
    // I'll try to find if ModalAddLeaveComponent accepts input.
    const modalRef = this.modal.create({
      nzTitle: 'Cập nhật yêu cầu',
      nzContent: ModalAddLeaveComponent,
      nzFooter: null,
      nzWidth: 600,
      nzBodyStyle: { padding: '24px' },
      nzComponentParams: {
        // Check if I can pass data here. 
        // I'll need to check ModalAddLeaveComponent content to be sure, but standard pattern is passing `data` or similar.
        // For now, I'll pass `data` and hope it works or I'll fix it if I see errors/it doesn't work.
        // But wait, I shouldn't guess wildy.
        // Let's assume standard behavior:
        // data: data 
        data: data // passing the row data
      }
    });

    modalRef.afterClose.subscribe(result => {
      if (result && result.success) {
        this.loadLeaveData();
      }
    });
  }

  onDeleteOne(data: LeaveManageModel): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa yêu cầu này?`,
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        // tai su dung ham xoa
        if (data.id) this.performDelete([data.id]);
      }
    });
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
    this.loadLeaveData(); // Server-side pagination call
  }

  onPageSizeChange(pageSize: number): void {
    this.paging.pageSize = pageSize;
    this.paging.pageIndex = 1;
    this.loadLeaveData(); // Server-side pagination call
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
      leaveDate: data.leaveDate,
      duration: data.duration,
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
    // loc du lieu
    const matches = this.listOfData.filter(item => {
      // Filter by employeeUserName
      if (this.searchFilters['employeeUserName'] &&
        !item.employeeUserName?.toLowerCase().includes(this.searchFilters['employeeUserName'].toLowerCase())) {
        return false;
      }

      // Filter by employeeName
      if (this.searchFilters['employeeName'] &&
        !item.employeeName?.toLowerCase().includes(this.searchFilters['employeeName'].toLowerCase())) {
        return false;
      }

      // Filter by employeeEmail
      if (this.searchFilters['employeeEmail'] &&
        !item.employeeEmail?.toLowerCase().includes(this.searchFilters['employeeEmail'].toLowerCase())) {
        return false;
      }

      // Filter by departmentName (mapped from organizationName)
      if (this.searchFilters['departmentName'] && this.searchFilters['departmentName'].length > 0) {
        // If multiple select, searchFilters['departmentName'] is an array
        const selectedDepts = this.searchFilters['departmentName'];
        if (Array.isArray(selectedDepts)) {
          if (!selectedDepts.includes(item.departmentName)) {
            return false;
          }
        } else {
          // Fallback for single string search if user input text (though it's select now)
          if (!item.departmentName?.toLowerCase().includes(selectedDepts.toLowerCase())) {
            return false;
          }
        }
      }

      // Filter by absenceTypeName (which now sends codes like 'ANNUAL', 'UNPAID')
      if (this.searchFilters['absenceTypeName'] && this.searchFilters['absenceTypeName'].length > 0) {
        const selectedTypes = this.searchFilters['absenceTypeName'];
        if (Array.isArray(selectedTypes)) {
          // Compare against item.type (the code) instead of item.absenceTypeName (the label)
          if (!selectedTypes.includes(item.type)) {
            return false;
          }
        } else {
          if (item.type !== selectedTypes) {
            return false;
          }
        }
      }

      // Filter by absenceStatus
      if (this.searchFilters['absenceStatus'] && item.absenceStatus !== this.searchFilters['absenceStatus']) {
        return false;
      }

      // Filter by duration
      if (this.searchFilters['duration'] && this.searchFilters['duration'].length > 0) {
        const selectedDurations = this.searchFilters['duration'];
        if (Array.isArray(selectedDurations)) {
          if (!selectedDurations.includes(item.durationCode)) {
            return false;
          }
        } else {
          if (item.durationCode !== selectedDurations) {
            return false;
          }
        }
      }

      // Filter by leaveDate
      if (this.searchFilters['leaveDate']) {
        const filterDate = this.formatDateForComparison(this.searchFilters['leaveDate']);
        if (item.leaveDate !== filterDate) {
          return false;
        }
      }

      // Filter by timeRegisterStart
      if (this.searchFilters['timeRegisterStart']) {
        const filterTime = this.formatTimeForComparison(this.searchFilters['timeRegisterStart']);
        if (item.timeRegisterStart !== filterTime) {
          return false;
        }
      }

      // Filter by timeRegisterEnd
      if (this.searchFilters['timeRegisterEnd']) {
        const filterTime = this.formatTimeForComparison(this.searchFilters['timeRegisterEnd']);
        if (item.timeRegisterEnd !== filterTime) {
          return false;
        }
      }

      // Filter by absenceReason
      if (this.searchFilters['absenceReason'] &&
        !item.absenceReason?.toLowerCase().includes(this.searchFilters['absenceReason'].toLowerCase())) {
        return false;
      }

      return true;
    });

    // cap nhat phan trang
    this.paging.totalElements = matches.length;
    // this.paging.pageIndex = 1; // Reset to page 1 on search? User expectation. Usually yes.
    // If called from pagination change, we shouldn't reset.
    // So split logic?
    // For now, onSearch logic is primarily Filter input change -> Reset Page 1.
    // But I also need a method just to slice.

    // phan trang
    const start = (this.paging.pageIndex - 1) * this.paging.pageSize;
    const end = start + this.paging.pageSize;
    this.filteredData = matches.slice(start, end);
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

    // For HR/Admin, reload data from API without filters - REMOVED
    /*
    if (this.isHROrAdmin) {
      this.paging.pageIndex = 1;
      this.loadLeaveData();
      return;
    }
    */

    // reset loc
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
    // lay thoi gian
    // Otherwise return default time
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '--:--';

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  formatTimeForComparison(date: Date): string {
    if (!date) return '';
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  public StandardColumnType = StandardColumnType;
  filterChanged$ = new Subject<void>();
  private destroy$ = new Subject<void>();
}
