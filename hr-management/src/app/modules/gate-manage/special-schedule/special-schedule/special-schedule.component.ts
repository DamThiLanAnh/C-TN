import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
import { Subject } from 'rxjs';
import { finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { ModalViewDetailSpecialScheduleComponent } from '../modal-view-detail-special-schedule/modal-view-detail-special-schedule.component';
import { ConfirmModalComponent } from '../../../shares/components/confirm-modal/confirm-modal.component';
import { SpecialScheduleService } from '../special-schedule.service';
import { AuthService } from '../../../../services/auth.service';
import { specialScheduleColumns } from '../special-schedule.columns';
import { StandardColumnModel, StandardColumnType } from '../../../shares/interfaces';
import { RequestStatus } from '../../../shares/enum/options.constants';
import { scheduleTypes } from '../special-schedule.constant';
import { SpecialScheduleDetail } from '../special-schedule.model';
import { ModalAddSpecialScheduleComponent } from '../modal-add-special-schedule/modal-add-special-schedule.component';

@Component({
  selector: 'app-special-schedule',
  templateUrl: './special-schedule.component.html',
  styleUrls: ['./special-schedule.component.scss'],
})
export class SpecialScheduleComponent implements OnInit {
  listOfData: SpecialScheduleDetail[] = [];
  filteredData: SpecialScheduleDetail[] = [];
  tableName = 'Quản lý lịch làm đặc thù';
  dataDeleteChecked: SpecialScheduleDetail[] = [];
  canApprove: boolean = true;
  isEmployee: boolean = false;
  isManager = false;
  isHROrAdmin = false;
  currentUser: any;

  specialScheduleColumns: StandardColumnModel[] = [];
  public StandardColumnType = StandardColumnType;

  // Phan trang
  paging = {
    pageIndex: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0
  };

  // Trang thai bang
  checked = false;
  indeterminate = false;
  loadingTable = false;

  // Luong tim kiem
  public searchFilters: { [key: string]: any } = {};
  public searchSubject = new Subject<any>();

  rejectForm!: FormGroup;

  constructor(
    private modalService: NzModalService,
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private specialScheduleService: SpecialScheduleService,
    private authService: AuthService
  ) {
    this.rejectForm = this.fb.group({
      reason: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Kiem tra quyen su dung authService
    this.isManager = this.authService.isManager();
    this.isHROrAdmin = this.authService.isHROrAdmin();
    this.currentUser = this.authService.getUser();

    // Dieu chinh giao dien dua tren quyen
    this.canApprove = this.authService.canApprove();

    if (this.canApprove) {
      this.tableName = 'Quản lý lịch làm đặc thù (Duyệt)';
      this.isEmployee = false;
    } else {
      this.tableName = 'Lịch làm đặc thù của tôi';
      this.isEmployee = true;
    }

    this.specialScheduleColumns = specialScheduleColumns(this.isManager || this.isHROrAdmin);

    this.setupStreamSearch();
    this.loadData();
  }



  loadData(): void {
    this.loadingTable = true;
    let apiCall;
    const params = {
      page: this.paging.pageIndex > 0 ? this.paging.pageIndex - 1 : 0,
      size: this.paging.pageSize
    };
    if (this.canApprove) {
      // Su dung getPendingSpecialSchedulesApi cho Quan ly/Nguoi duyet
      apiCall = this.specialScheduleService.getPendingSpecialSchedulesApi(params);
    } else {
      apiCall = this.specialScheduleService.getMySpecialSchedulesApi(params);
    }

    apiCall.pipe(finalize(() => this.loadingTable = false)).subscribe(
      (response) => {
        const content = response?.content || [];
        // Cap nhat totalElements tu API
        if (response?.totalElements !== undefined) {
          this.paging.totalElements = response.totalElements;
        }

        this.listOfData = content.map((item: any, index: number) => ({
          ...item,
          index: index + 1,
          checked: false,
          disabled: item.status !== 'PENDING',
          isActiveAction: item.status === 'PENDING',
          // Anh xa cac truong duoc yeu cau
          employeeCode: item.employeeCode,
          employeeName: item.employeeName,
          departmentName: item.departmentName,
          projectName: item.projectName,
          projectCode: item.projectCode,
          managerName: item.managerName,
          approverId: item.approverId
        }));

        this.filteredData = this.listOfData; // Gan luon filteredData cho phan trang server
        // Ap dung bo loc ban dau (neu can thiet loc them phia client tren trang hien tai)
        // this.onSearch();
      },
      (error) => {
        this.listOfData = [];
        this.filteredData = [];
        // this.paging.totalElements = 0;
      }
    );
  }

  onSearch(): void {
    // Loc phia client
    const matches = this.listOfData.filter(item => {
      // Loc theo ma nhan vien
      if (this.searchFilters['employeeCode'] &&
        !item.employeeCode?.toLowerCase().includes(this.searchFilters['employeeCode'].toLowerCase())) {
        return false;
      }

      // Loc theo ten nhan vien
      if (this.searchFilters['employeeName'] &&
        !item.employeeName?.toLowerCase().includes(this.searchFilters['employeeName'].toLowerCase())) {
        return false;
      }

      // Loc theo ten phong ban
      if (this.searchFilters['departmentName'] &&
        !item.departmentName?.toLowerCase().includes(this.searchFilters['departmentName'].toLowerCase())) {
        return false;
      }

      // Loc theo ngay bat dau
      if (this.searchFilters['startDate']) {
        const filterDate = this.formatDateForComparison(this.searchFilters['startDate']);
        if (item.startDate !== filterDate) {
          return false;
        }
      }

      // Loc theo ngay ket thuc
      if (this.searchFilters['endDate']) {
        const filterDate = this.formatDateForComparison(this.searchFilters['endDate']);
        if (item.endDate !== filterDate) {
          return false;
        }
      }

      // Loc theo gio bat dau (morningStart)
      if (this.searchFilters['morningStart']) {
        const filterTime = this.searchFilters['morningStart'] instanceof Date
          ? this.formatTime(this.searchFilters['morningStart'])
          : this.searchFilters['morningStart'];

        if (!item.morningStart?.includes(filterTime)) {
          return false;
        }
      }

      // Loc theo gio ket thuc (afternoonEnd)
      if (this.searchFilters['afternoonEnd']) {
        const filterTime = this.searchFilters['afternoonEnd'] instanceof Date
          ? this.formatTime(this.searchFilters['afternoonEnd'])
          : this.searchFilters['afternoonEnd'];

        if (!item.afternoonEnd?.includes(filterTime)) {
          return false;
        }
      }

      // Loc theo loai
      if (this.searchFilters['type'] && item.type !== this.searchFilters['type']) {
        return false;
      }

      // Loc theo trang thai
      if (this.searchFilters['status'] && item.status !== this.searchFilters['status']) {
        return false;
      }

      // Loc theo ly do
      if (this.searchFilters['reason'] &&
        !item.reason?.toLowerCase().includes(this.searchFilters['reason'].toLowerCase())) {
        return false;
      }

      return true;
    });

    this.paging.totalElements = matches.length;
    // Luu y: Khong reset pageIndex o day de tranh nhay trang bat ngo...
    // this.paging.pageIndex = 1; 

    // Cap nhat du lieu hien thi (phan trang client)
    this.updateDisplayedData(matches);
  }

  updateDisplayedData(matches: SpecialScheduleDetail[]): void {
    const start = (this.paging.pageIndex - 1) * this.paging.pageSize;
    const end = start + this.paging.pageSize;
    this.filteredData = matches.slice(start, end);
  }

  // Ho tro dinh dang ngay
  formatDateForComparison(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Helper formatting Hour
  formatTime(date: Date): string {
    if (!date) return '';
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  // Ghi de setupStreamSearch de goi onSearch cuc bo
  private setupStreamSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.paging.pageIndex = 1;
      this.onSearch();
    });
  }

  onFilterInTable(event: NzTableQueryParams): void {
    // ignored for client side mostly, or used for verify
    const { pageIndex, pageSize } = event;
    this.paging.pageIndex = pageIndex;
    this.paging.pageSize = pageSize;
    this.onSearch();
  }

  getChangePagination(page: number): void {
    this.paging.pageIndex = page;
    this.loadData();
  }

  onPageSizeChange(size: number): void {
    this.paging.pageSize = size;
    this.paging.pageIndex = 1;
    this.loadData();
  }

  onItemChecked(item: SpecialScheduleDetail, checked: boolean): void {
    item.checked = checked;
    if (checked) {
      this.dataDeleteChecked.push(item);
    } else {
      this.dataDeleteChecked = this.dataDeleteChecked.filter(d => d.id !== item.id);
    }
    this.refreshCheckedStatus();
  }

  handleAction(actionKey: string, data: SpecialScheduleDetail): void {
    if (actionKey === 'approve') {
      data.checked = true;
      this.dataDeleteChecked = [data];
      this.onApproveList();
    } else if (actionKey === 'reject') {
      data.checked = true;
      this.dataDeleteChecked = [data];
      this.onRejectList();
    } else if (actionKey === 'edit') {
      this.onEdit(data);
    } else if (actionKey === 'delete') {
      this.onDeleteOne(data);
    }
  }

  onEdit(data: SpecialScheduleDetail): void {
    const modalRef = this.modalService.create({
      nzTitle: 'Cập nhật lịch làm đặc thù',
      nzContent: ModalAddSpecialScheduleComponent,
      nzFooter: null,
      nzWidth: 600,
      nzClassName: 'rounded-modal',
      nzBodyStyle: { padding: '16px' },
      nzComponentParams: {
        data: data
      }
    });

    modalRef.afterClose.subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  onDeleteOne(data: SpecialScheduleDetail): void {
    this.modalService.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa lịch làm này?`,
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        if (data.id) {
          this.loadingTable = true;
          this.specialScheduleService.deleteSpecialScheduleApi(data.id).subscribe(
            () => {
              this.messageService.success('Xóa thành công');
              this.loadData();
              this.loadingTable = false;
            },
            (err) => {
              this.messageService.error('Xóa thất bại: ' + (err.error?.message || err.message));
              this.loadingTable = false;
            }
          );
        }
      }
    });
  }

  onChangeSelectAll(checked: boolean): void {
    // Select all IN THE FILTERED LIST (visible pages)??
    // Usually select all applies to the current view.
    // If we want to check all in filtered list:
    this.filteredData.forEach(item => {
      if (!item.disabled) {
        item.checked = checked;
        if (checked) {
          if (!this.dataDeleteChecked.some(d => d.id === item.id)) {
            this.dataDeleteChecked.push(item);
          }
        } else {
          this.dataDeleteChecked = this.dataDeleteChecked.filter(d => d.id !== item.id);
        }
      }
    });
    // Also update listOfData to keep sync if we ever go back to full list?
    // It's safer to just iterate listOfData but that selects invisible items too.
    // Standard behavior: Select all usually selects visible items on page or all filtered items.
    // Let's select all filtered items.

    this.refreshCheckedStatus();
  }

  onChangeUnselectData(): void {
    this.listOfData.forEach(item => item.checked = false);
    this.dataDeleteChecked = [];
    this.refreshCheckedStatus();
  }

  isDataSelected(): boolean {
    return this.dataDeleteChecked.length > 0;
  }

  private refreshCheckedStatus(): void {
    // Check based on filteredData or listOfData?
    // Currently checked status is shown for visible items (filteredData).
    const validItems = this.filteredData.filter(item => !item.disabled);
    if (validItems.length === 0) {
      this.checked = false;
      this.indeterminate = false;
      return;
    }

    const allChecked = validItems.every(item => item.checked);
    const someChecked = validItems.some(item => item.checked);

    this.checked = allChecked;
    this.indeterminate = someChecked && !allChecked;
  }

  viewDetail(row: SpecialScheduleDetail): void {
    this.modalService.create({
      nzContent: ModalViewDetailSpecialScheduleComponent,
      nzMaskClosable: false,
      nzWidth: '35vw',
      nzFooter: null,
      nzComponentParams: {
        item: row, // Pass local data directly
        canApprove: this.canApprove,
        onApprove: (item: any) => this.onApproveConfirm(item, () => this.loadData()),
        onReject: (item: any) => this.onRejectConfirm(item, () => this.loadData())
      },
    });
  }



  onApproveConfirm(data: SpecialScheduleDetail, onCloseModal?: () => void): void {
    const modal: NzModalRef = this.modalService.create({
      nzContent: ConfirmModalComponent,
      nzCentered: true,
      nzFooter: null,
      nzClassName: 'custom-confirm-modal',
      nzComponentParams: {
        type: 'approve',
        title: 'Xác nhận duyệt',
        content: 'Bạn có muốn duyệt không?'
      },
    });

    modal.afterClose.subscribe((result) => {
      if (result && result.success) {
        this.processDecision([data.id!], 'APPROVE', result.reason, onCloseModal);
      }
    });
  }

  onRejectConfirm(data: SpecialScheduleDetail, onCloseModal?: () => void): void {
    const modal: NzModalRef = this.modalService.create({
      nzContent: ConfirmModalComponent,
      nzCentered: true,
      nzFooter: null,
      nzClassName: 'custom-confirm-modal',
      nzComponentParams: {
        type: 'reject',
        title: 'Xác nhận từ chối',
        content: 'Bạn có muốn từ chối không?',
        requireReason: true
      },
    });

    modal.afterClose.subscribe((result) => {
      if (result && result.success) {
        this.processDecision([data.id!], 'REJECT', result.reason, onCloseModal);
      }
    });
  }



  onApproveList(): void {
    if (this.dataDeleteChecked.length === 0) return;

    const modal: NzModalRef = this.modalService.create({
      nzContent: ConfirmModalComponent,
      nzCentered: true,
      nzFooter: null,
      nzClassName: 'custom-confirm-modal',
      nzComponentParams: {
        type: 'approve',
        title: 'Xác nhận duyệt',
        content: `Bạn có muốn duyệt ${this.dataDeleteChecked.length} mục không?`
      },
    });

    modal.afterClose.subscribe((result) => {
      if (result && result.success) {
        const ids = this.dataDeleteChecked.map(d => d.id!).filter(id => id !== undefined);
        this.processDecision(ids, 'APPROVE', result.reason);
      }
    });
  }

  onRejectList(): void {
    if (this.dataDeleteChecked.length === 0) return;

    const modal: NzModalRef = this.modalService.create({
      nzContent: ConfirmModalComponent,
      nzCentered: true,
      nzFooter: null,
      nzClassName: 'custom-confirm-modal',
      nzComponentParams: {
        type: 'reject',
        title: 'Xác nhận từ chối',
        content: `Bạn có muốn từ chối ${this.dataDeleteChecked.length} mục không?`,
        requireReason: true
      },
    });

    modal.afterClose.subscribe((result) => {
      if (result && result.success) {
        const ids = this.dataDeleteChecked.map(d => d.id!).filter(id => id !== undefined);
        this.processDecision(ids, 'REJECT', result.reason);
      }
    });
  }

  private processDecision(ids: number[], action: 'APPROVE' | 'REJECT', reason?: string, callback?: () => void): void {
    if (ids.length === 0) return;

    this.loadingTable = true;
    const body = {
      ids,
      action,
      managerNote: reason || ''
    };

    this.specialScheduleService.decisionSpecialScheduleApi(body).subscribe(
      (res: any) => {
        this.loadingTable = false;

        // Xu ly phan hoi voi danh sach thanh cong va that bai
        const successCount = res.success ? res.success.length : 0;
        const failedCount = res.failed ? res.failed.length : 0;

        if (successCount > 0) {
          this.messageService.success(`Đã ${action === 'APPROVE' ? 'duyệt' : 'từ chối'} thành công ${successCount} yêu cầu`);
        }

        if (failedCount > 0) {
          this.messageService.error(`Không thể ${action === 'APPROVE' ? 'duyệt' : 'từ chối'} ${failedCount} yêu cầu (ID: ${res.failed.join(', ')})`);
        }

        if (successCount === 0 && failedCount === 0) {
          this.messageService.success(`Đã ${action === 'APPROVE' ? 'duyệt' : 'từ chối'} thành công yêu cầu`);
        }

        this.dataDeleteChecked = [];
        this.loadData();
        if (callback) callback();
      },
      (err) => {
        console.error(`Error processing decision:`, err);
        this.loadingTable = false;
        const errorMessage = err.error?.message || err.error || err.message || 'Lỗi không xác định';
        this.messageService.error(`Lỗi xử lý yêu cầu: ${errorMessage}`);
      }
    );
  }

  getStatusColor(status: string): string {
    const statusOption = RequestStatus.find(s => s.value === status);
    return statusOption?.color || 'default';
  }

  getStatusLabel(status: string): string {
    const statusOption = RequestStatus.find(s => s.value === status);
    return statusOption?.label || status;
  }

  getTypeLabel(type: string): string {
    const typeOption = scheduleTypes.find(t => t.value === type);
    return typeOption?.label || type;
  }

  getTypeColor(type: string): string {
    return 'default'; // Or add specific colors if needed
  }

  openAddSpecialScheduleModal(): void {
    const modalRef = this.modalService.create({
      nzTitle: 'Thêm mới lịch đặc thù',
      nzContent: ModalAddSpecialScheduleComponent,
      nzFooter: null,
      nzWidth: 600,
      nzClassName: 'rounded-modal',
      nzBodyStyle: { padding: '16px' }
    });
    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.loadData();
      }
    });
  }
}


