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

export interface SpecialScheduleItem {
  id: string;
  index: number;
  userName: string;
  fullName: string;
  scheduleType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  beginDate: string;
  endDate: string;
  checked: boolean;
  disabled: boolean;
  isActiveAction: boolean;
  [key: string]: any;
}

export interface TableColumn {
  nzTitle: string;
  nzKey: string;
  sortFn?: (a: SpecialScheduleItem, b: SpecialScheduleItem) => number;
  sortOrder?: 'descend' | 'ascend' | null;
  sortDirections?: Array<'descend' | 'ascend' | null>;
}

const specialScheduleColumns: TableColumn[] = [
  { nzTitle: 'STT', nzKey: 'index' },
  { nzTitle: 'Tài khoản', nzKey: 'userName', sortFn: (a, b) => a.userName.localeCompare(b.userName) },
  { nzTitle: 'Tên nhân viên', nzKey: 'fullName' },
  { nzTitle: 'Loại lịch', nzKey: 'scheduleType' },
  { nzTitle: 'Trạng thái', nzKey: 'status' },
  { nzTitle: 'Ngày bắt đầu', nzKey: 'beginDate' },
  { nzTitle: 'Ngày kết thúc', nzKey: 'endDate' },
];


@Component({
  selector: 'app-special-schedule',
  templateUrl: './special-schedule.component.html',
  styleUrls: ['./special-schedule.component.scss'],
})
export class SpecialScheduleComponent implements OnInit {
  listOfData: SpecialScheduleItem[] = [];
  tableName = 'Quản lý lịch làm đặc thù';
  dataDeleteChecked: SpecialScheduleItem[] = [];
  canApprove: boolean = true;
  columns: TableColumn[] = specialScheduleColumns;
  isEmployee: boolean = false; // Flag to check if user is employee
  isManager: boolean = false; // Flag to check if user is manager
  isApprover: boolean = false; // Flag to check if user is approver

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
  loadingDataTable = false;
  isExporting = false;

  // Search stream
  private searchSubject = new Subject<any>();

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
    this.authService.authState$.subscribe(state => {
      if (state && state.token) {
        // Cập nhật lại role dựa trên user hoặc token mới nhất
        const userRole = this.authService.getUserRole();
        this.isEmployee = userRole === 'EMPLOYEE';
        this.isManager = userRole === 'MANAGER';
        // this.isApprover = userRole === 'APPROVER' || userRole === 'APPROVAL' || userRole === 'MY_APPROVALS';

        // Adjust UI based on role
        if (this.isEmployee) {
          this.tableName = 'Lịch làm đặc thù của tôi';
          this.canApprove = false;
        } else {
          this.canApprove = true;
        }

        // Gọi loadData sau khi đã xác định role
        this.loadData();
      }
    });
    this.setupStreamSearch();
    // Xoá toàn bộ logic xác định role và loadData() trực tiếp khỏi ngOnInit
  }

  private setupStreamSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      // switchMap((payload: any) => this.apiSearch(payload))
    ).subscribe();
  }

  private loadData(): void {
    this.loadingDataTable = true;
    let apiCall;
    const params = {
      page: this.paging.pageIndex - 1,
      size: this.paging.pageSize
    };
    if (this.isEmployee) {
      apiCall = this.specialScheduleService.getMySpecialSchedulesApi(params);
    } else if (this.isManager) {
      apiCall = this.specialScheduleService.getDepartmentSpecialSchedulesApi(params);
    } else if (this.isApprover) {
      apiCall = this.specialScheduleService.getMyApprovalsSpecialSchedulesApi(params);
    } else {
      // Nếu cần, có thể thêm API cho admin hoặc các role khác
      this.listOfData = [];
      this.loadingDataTable = false;
      return;
    }
    apiCall.pipe(finalize(() => this.loadingDataTable = false)).subscribe(
      (response) => {
        const content = response?.content || [];
        this.listOfData = content.map((item: any, index: number) => ({
          ...item,
          index: (this.paging.pageIndex - 1) * this.paging.pageSize + index + 1,
          userName: item.employeeCode || item.staff?.userName || '',
          fullName: item.employeeName || item.staff?.fullName || '',
          scheduleType: item.type || item.scheduleType?.name || '',
          status: item.status,
          beginDate: item.startDate || item.beginDate,
          endDate: item.endDate,
          checked: false,
          disabled: item.status !== 'PENDING',
          isActiveAction: item.status === 'PENDING',
        }));
        this.paging.totalElements = response?.totalElements || this.listOfData.length;
        this.paging.totalPages = response?.totalPages || 1;
      },
      (error) => {
        this.messageService.error('Không thể tải dữ liệu lịch đặc thù: ' + (error.error || error.message || 'Unknown error'));
        this.listOfData = [];
        this.paging.totalElements = 0;
        this.paging.totalPages = 1;
      }
    );
  }


  // --- CHECKBOX/SELECT METHODS ---

  onItemChecked(item: SpecialScheduleItem, checked: boolean): void {
    item.checked = checked;
    if (checked) {
      this.dataDeleteChecked.push(item);
    } else {
      this.dataDeleteChecked = this.dataDeleteChecked.filter(d => d.id !== item.id);
    }
    this.refreshCheckedStatus();
  }

  onChangeSelectAll(checked: boolean): void {
    this.listOfData = this.listOfData.map(item => ({
      ...item,
      checked: checked && !item.disabled
    }));
    this.dataDeleteChecked = checked ? this.listOfData.filter(item => !item.disabled) : [];
    this.refreshCheckedStatus();
  }

  onChangeUnselectData(): void {
    this.listOfData = this.listOfData.map((item: any) => ({
      ...item,
      checked: false
    }));
    this.dataDeleteChecked = [];
    this.refreshCheckedStatus();
  }

  isDataSelected(): boolean {
    return this.dataDeleteChecked.length > 0;
  }

  private refreshCheckedStatus(): void {
    const allChecked = this.listOfData.length > 0 && this.listOfData.every(item => item.checked || item.disabled);
    const allUnchecked = this.listOfData.every(item => !item.checked);
    const indeterminate = !allChecked && !allUnchecked;

    this.checked = allChecked;
    this.indeterminate = indeterminate;
  }


  onFilterInTable(event: NzTableQueryParams): void {
    const { pageIndex, pageSize, sort } = event;
    const currentSort = sort.find(item => item.value !== null);
    this.searchSubject.next({
      page: pageIndex,
      size: pageSize,
      sortBy: currentSort?.key || 'createdDate',
      sortDirection: currentSort?.value === 'ascend' ? 'ASC' : 'DESC'
    });
  }

  getChangePagination(page: number): void {
    this.paging.pageIndex = page;
    this.searchSubject.next({
      page: page,
      size: this.paging.pageSize
    });
  }

  onPageSizeChange(size: number): void {
    this.paging.pageSize = size;
    this.paging.pageIndex = 1;
    this.searchSubject.next({
      page: 1,
      size: size
    });
  }

  viewDetail(row: SpecialScheduleItem): void {
    console.log('🔵 Fetching detail for ID:', row.id);
    this.loadingDataTable = true;

    this.specialScheduleService.findByIdApi(row.id).pipe(
      finalize(() => this.loadingDataTable = false)
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



  onApproveConfirm(data: SpecialScheduleItem, onCloseModal?: () => void): void {
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
        this.loadingDataTable = true;
        // MOCK - Giả lập approve
        setTimeout(() => {
          this.loadingDataTable = false;
          this.messageService.success('Bạn đã phê duyệt thành công (Mock)');
          this.getChangePagination(this.paging.pageIndex);
          if (onCloseModal) onCloseModal();
        }, 500);
      }
    });
  }

  onRejectConfirm(data: SpecialScheduleItem, onCloseModal?: () => void): void {
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
        this.loadingDataTable = true;
        // MOCK - Giả lập reject
        setTimeout(() => {
          this.loadingDataTable = false;
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
        this.loadingDataTable = true;
        // MOCK - Giả lập approve list
        setTimeout(() => {
          this.loadingDataTable = false;
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
        this.loadingDataTable = true;
        // MOCK - Giả lập reject list
        setTimeout(() => {
          this.loadingDataTable = false;
          this.messageService.success('Bạn đã từ chối phê duyệt danh sách thành công (Mock)');
          this.dataDeleteChecked = [];
          this.getChangePagination(this.paging.pageIndex);
        }, 500);
      }
    });
  }

  openAddSpecialScheduleModal(): void {
    const modal = this.modalService.create({
      nzTitle: 'Thêm mới lịch đặc thù',
      nzContent: 'app-modal-add-special-schedule',
      nzFooter: null,
      nzWidth: 800
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }
}
