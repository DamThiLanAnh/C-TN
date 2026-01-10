import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
import { Subject } from 'rxjs';
import { finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { ModalViewDetailSpecialScheduleComponent } from '../modal-view-detail-special-schedule/modal-view-detail-special-schedule.component';
import { ModalConfirmationComponent } from '../modal-confirmation/modal-confirmation.component';
import { SpecialScheduleService } from '../special-schedule.service';
import { AuthService } from '../../../../services/auth.service';
import { specialScheduleColumns } from '../special-schedule.columns';
import { StandardColumnModel, StandardColumnType } from '../../../shares/interfaces';
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
  isEmployee: boolean = false; // Flag to check if user is employee
  isManager = false;
  isHROrAdmin = false;
  currentUser: any;

  specialScheduleColumns: StandardColumnModel[] = []; // Initialize empty
  public StandardColumnType = StandardColumnType;

  // Pagination
  paging = {
    pageIndex: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0
  };

  // Table state
  checked = false;
  indeterminate = false;
  loadingTable = false;

  // Search stream
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
    console.trace('SpecialScheduleComponent instantiated');
    this.rejectForm = this.fb.group({
      reason: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    console.log('SpecialScheduleComponent initialized');

    // Check roles using authService methods like LeaveManageComponent
    this.isManager = this.authService.isManager();
    this.isHROrAdmin = this.authService.isHROrAdmin(); // Assuming similar admin rights might be needed, or just for consistency
    this.currentUser = this.authService.getUser();

    // Adjust UI based on role
    if (this.isManager || this.isHROrAdmin) {
      this.tableName = 'Quản lý lịch làm đặc thù (Duyệt)';
      this.canApprove = true;
      this.isEmployee = false;
    } else {
      this.tableName = 'Lịch làm đặc thù của tôi';
      this.canApprove = false;
      this.isEmployee = true;
    }

    this.specialScheduleColumns = specialScheduleColumns(this.isManager || this.isHROrAdmin);

    this.setupStreamSearch();
    this.loadData();
  }



  loadData(): void {
    this.loadingTable = true;
    let apiCall;
    // Client-side filtering strategy: Load "all" (limit 1000)
    const params = {
      page: 0,
      size: 1000
    };
    if (this.isManager || this.isHROrAdmin) {
      // Use getPendingSpecialSchedulesApi for Manager/Approver
      apiCall = this.specialScheduleService.getPendingSpecialSchedulesApi(params);
    } else {
      apiCall = this.specialScheduleService.getMySpecialSchedulesApi(params);
    }

    apiCall.pipe(finalize(() => this.loadingTable = false)).subscribe(
      (response) => {
        const content = response?.content || [];
        this.listOfData = content.map((item: any, index: number) => ({
          ...item,
          index: index + 1,
          checked: false,
          disabled: item.status !== 'PENDING',
          isActiveAction: item.status === 'PENDING',
          // Explicitly map fields requested
          employeeCode: item.employeeCode,
          employeeName: item.employeeName,
          departmentName: item.departmentName,
          projectName: item.projectName,
          projectCode: item.projectCode,
          managerName: item.managerName,
          approverId: item.approverId
        }));

        // Initial filter application
        this.onSearch();
      },
      (error) => {
        this.listOfData = [];
        this.paging.totalElements = 0;
      }
    );
  }

  onSearch(): void {
    // Client-side filtering
    const matches = this.listOfData.filter(item => {
      // Filter by employeeCode
      if (this.searchFilters['employeeCode'] &&
        !item.employeeCode?.toLowerCase().includes(this.searchFilters['employeeCode'].toLowerCase())) {
        return false;
      }

      // Filter by employeeName
      if (this.searchFilters['employeeName'] &&
        !item.employeeName?.toLowerCase().includes(this.searchFilters['employeeName'].toLowerCase())) {
        return false;
      }

      // Filter by departmentName
      if (this.searchFilters['departmentName'] &&
        !item.departmentName?.toLowerCase().includes(this.searchFilters['departmentName'].toLowerCase())) {
        return false;
      }

      // Filter by startDate
      if (this.searchFilters['startDate']) {
        const filterDate = this.formatDateForComparison(this.searchFilters['startDate']);
        if (item.startDate !== filterDate) {
          return false;
        }
      }

      // Filter by endDate
      if (this.searchFilters['endDate']) {
        const filterDate = this.formatDateForComparison(this.searchFilters['endDate']);
        if (item.endDate !== filterDate) {
          return false;
        }
      }

      // Filter by type
      if (this.searchFilters['type'] && item.type !== this.searchFilters['type']) {
        return false;
      }

      // Filter by status
      if (this.searchFilters['status'] && item.status !== this.searchFilters['status']) {
        return false;
      }

      // Filter by reason
      if (this.searchFilters['reason'] &&
        !item.reason?.toLowerCase().includes(this.searchFilters['reason'].toLowerCase())) {
        return false;
      }

      return true;
    });

    this.paging.totalElements = matches.length;
    // Note: Do not reset pageIndex here to avoid jumping pages unexpectedly during typing if we stay on same page concept,
    // but usually search resets to page 1.
    // this.paging.pageIndex = 1; 

    // Update displayed data (client-side pagination)
    this.updateDisplayedData(matches);
  }

  updateDisplayedData(matches: SpecialScheduleDetail[]): void {
    const start = (this.paging.pageIndex - 1) * this.paging.pageSize;
    const end = start + this.paging.pageSize;
    this.filteredData = matches.slice(start, end);
    // Also, we need to update totalElements if we are filtering?
    // In onSearch we already did: this.paging.totalElements = matches.length;
  }

  // Helper for date format
  formatDateForComparison(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Override setupStreamSearch to call onSearch locally
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
    this.onSearch();
  }

  onPageSizeChange(size: number): void {
    this.paging.pageSize = size;
    this.paging.pageIndex = 1;
    this.onSearch();
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
    this.loadingTable = true;
    this.specialScheduleService.findByIdApi(data.id).pipe(
      finalize(() => this.loadingTable = false)
    ).subscribe({
      next: (response) => {
        const modalRef = this.modalService.create({
          nzTitle: 'Cập nhật lịch làm đặc thù',
          nzContent: ModalAddSpecialScheduleComponent,
          nzFooter: null,
          nzWidth: 800,
          nzClassName: 'rounded-modal',
          nzBodyStyle: { padding: '24px' },
          nzComponentParams: {
            data: response
          }
        });

        modalRef.afterClose.subscribe(result => {
          if (result) {
            this.loadData();
          }
        });
      },
      error: (err) => {
        this.messageService.error('Không thể tải thông tin chi tiết: ' + (err.error?.message || err.message));
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
    console.log('🔵 Fetching detail for ID:', row.id);
    this.loadingTable = true;

    this.specialScheduleService.findByIdApi(row.id).pipe(
      finalize(() => this.loadingTable = false)
    ).subscribe(
      (response) => {
        console.log('✅ Detail data received:', response);

        this.modalService.create({
          nzContent: ModalViewDetailSpecialScheduleComponent,
          nzMaskClosable: false,
          nzWidth: '35vw',
          nzFooter: null,
          nzComponentParams: {
            item: response, // Pass real API data
            canApprove: this.canApprove,
            onApprove: (item: any) => this.onApproveConfirm(item, () => this.loadData()),
            onReject: (item: any) => this.onRejectConfirm(item, () => this.loadData())
          },
        });
      },
      (error) => {
        console.error('❌ Error fetching detail:', error);
        this.messageService.error('Không thể tải chi tiết. Vui lòng thử lại!');
      }
    );
  }



  onApproveConfirm(data: SpecialScheduleDetail, onCloseModal?: () => void): void {
    const modal: NzModalRef = this.modalService.create({
      nzTitle: undefined,
      nzContent: ModalConfirmationComponent,
      nzCentered: true,
      nzComponentParams: {
        title: 'Xác nhận duyệt',
        message: 'Bạn có muốn duyệt không?',
        showReasonBox: false,
      },
    });

    modal.afterClose.subscribe((result) => {
      if (result) {
        this.loadingTable = true;
        // MOCK - Giả lập approve
        setTimeout(() => {
          this.loadingTable = false;
          this.messageService.success('Bạn đã phê duyệt thành công (Mock)');
          this.getChangePagination(this.paging.pageIndex);
          if (onCloseModal) onCloseModal();
        }, 500);
      }
    });
  }

  onRejectConfirm(data: SpecialScheduleDetail, onCloseModal?: () => void): void {
    const modal: NzModalRef = this.modalService.create({
      nzTitle: undefined,
      nzContent: ModalConfirmationComponent,
      nzCentered: true,
      nzComponentParams: {
        title: 'Xác nhận từ chối',
        message: 'Bạn có muốn từ chối không?',
        showReasonBox: true,
        reasonLabel: 'Lý do từ chối',
      },
    });

    modal.afterClose.subscribe((result) => {
      if (result) {
        this.loadingTable = true;
        // MOCK - Giả lập reject
        setTimeout(() => {
          this.loadingTable = false;
          this.messageService.success('Bạn đã từ chối phê duyệt thành công (Mock)');
          this.getChangePagination(this.paging.pageIndex);
          if (onCloseModal) onCloseModal();
        }, 500);
      }
    });
  }



  onApproveList(): void {
    if (this.dataDeleteChecked.length === 0) return;

    const modal: NzModalRef = this.modalService.create({
      nzTitle: undefined,
      nzContent: ModalConfirmationComponent,
      nzCentered: true,
      nzComponentParams: {
        title: 'Xác nhận duyệt',
        message: `Bạn có muốn duyệt ${this.dataDeleteChecked.length} mục không?`,
        showReasonBox: false,
      },
    });

    modal.afterClose.subscribe((result) => {
      if (result) {
        this.loadingTable = true;
        // MOCK - Giả lập approve list
        setTimeout(() => {
          this.loadingTable = false;
          this.messageService.success('Bạn đã phê duyệt danh sách thành công (Mock)');
          this.dataDeleteChecked = [];
          this.getChangePagination(this.paging.pageIndex);
        }, 500);
      }
    });
  }

  onRejectList(): void {
    if (this.dataDeleteChecked.length === 0) return;

    const modal: NzModalRef = this.modalService.create({
      nzTitle: undefined,
      nzContent: ModalConfirmationComponent,
      nzCentered: true,
      nzComponentParams: {
        title: 'Xác nhận từ chối',
        message: `Bạn có muốn từ chối ${this.dataDeleteChecked.length} mục không?`,
        showReasonBox: true,
        reasonLabel: 'Lý do từ chối',
      },
    });

    modal.afterClose.subscribe((result) => {
      if (result) {
        this.loadingTable = true;
        // MOCK - Giả lập reject list
        setTimeout(() => {
          this.loadingTable = false;
          this.messageService.success('Bạn đã từ chối phê duyệt danh sách thành công (Mock)');
          this.dataDeleteChecked = [];
          this.getChangePagination(this.paging.pageIndex);
        }, 500);
      }
    });
  }

  openAddSpecialScheduleModal(): void {
    const modalRef = this.modalService.create({
      nzTitle: 'Thêm mới lịch đặc thù',
      nzContent: ModalAddSpecialScheduleComponent,
      nzFooter: null,
      nzWidth: 800,
      nzClassName: 'rounded-modal',
      nzBodyStyle: { padding: '24px' }
    });
    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.loadData();
      }
    });
  }
}


