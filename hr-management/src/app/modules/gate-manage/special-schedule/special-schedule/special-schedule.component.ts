import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
import { Observable, Subject, of } from 'rxjs';
import { finalize, tap, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { ModalViewDetailSpecialScheduleComponent } from '../modal-view-detail-special-schedule/modal-view-detail-special-schedule.component';
import { ModalConfirmationComponent } from '../modal-confirmation/modal-confirmation.component';
import { SpecialScheduleService } from '../special-schedule.service';

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

  // Payload
  bodyPayload: any = {};
  paramPayload: any = {};

  // Search stream
  private searchSubject = new Subject<any>();

  rejectForm!: FormGroup;

  constructor(
    private modalService: NzModalService,
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private specialScheduleService: SpecialScheduleService
  ) {
    this.rejectForm = this.fb.group({
      reason: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    console.log('SpecialScheduleComponent initialized');
    console.log('Columns:', this.columns);
    this.setupStreamSearch();
    this.loadData();
  }

  private setupStreamSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((payload: any) => this.apiSearch(payload))
    ).subscribe();
  }

  private loadData(): void {
    this.searchSubject.next({
      page: this.paging.pageIndex,
      size: this.paging.pageSize
    });
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


  // --- API/SEARCH METHODS ---

  private getParamByPayload(payload: any): any {
    return {
      page: payload.page || this.paging.pageIndex,
      size: payload.size || this.paging.pageSize,
      sortBy: payload.sortBy || 'createdDate',
      sortDirection: payload.sortDirection || 'DESC'
    };
  }

  private getBodyByPayload(payload: any): any {
    const body: any = {};
    if (payload.userName) body.userName = payload.userName;
    if (payload.fullName) body.fullName = payload.fullName;
    if (payload.scheduleType) body.scheduleType = payload.scheduleType;
    if (payload.status) body.status = payload.status;
    if (payload.beginDate) body.beginDate = payload.beginDate;
    if (payload.endDate) body.endDate = payload.endDate;
    return body;
  }

  apiSearch(payload: any): Observable<any> {
    console.log('🔵 apiSearch called with payload:', payload);
    this.loadingDataTable = true;
    this.bodyPayload = this.getBodyByPayload(payload);
    this.paramPayload = this.getParamByPayload(payload);

    console.log('🔵 Calling API searchApi with body:', this.bodyPayload, 'params:', this.paramPayload);

    return this.specialScheduleService.searchApi(this.bodyPayload, this.paramPayload).pipe(
      tap((response: any) => {
        console.log('✅ API Response:', response);

        // Map API response to table data
        this.listOfData = (response?.data?.content || []).map(
          (item: any, index: number) => ({
            ...item,
            index: (this.paging.pageIndex - 1) * this.paging.pageSize + index + 1,
            userName: item.employeeCode || item.staff?.userName || '',
            fullName: item.employeeName || item.staff?.fullName || '',
            scheduleType: item.type || item.scheduleType?.name || '',
            status: item.status,
            beginDate: this.formatDate(item.startDate || item.beginDate),
            endDate: this.formatDate(item.endDate),
            checked: this.dataDeleteChecked.some(d => d.id === item.id),
            disabled: item.status !== 'PENDING',
            isActiveAction: item.status === 'PENDING',
          })
        );
        this.paging.totalElements = response?.data?.totalElements || 0;
        this.paging.totalPages = response?.data?.totalPages || 0;

        console.log('✅ Mapped list data:', this.listOfData);
      }),
      catchError(error => {
        console.error('❌ API Error:', error);

        // Specific handling for authorization errors
        if (error.status === 500) {
          const errorMessage = error.error || '';
          if (typeof errorMessage === 'string' && errorMessage.includes('not allowed')) {
            this.messageService.error('Bạn không có quyền truy cập. Vui lòng đăng nhập với tài khoản có quyền phù hợp.');
            console.warn('⚠️ Authorization issue: Current user role is not allowed to access this endpoint');
          } else {
            this.messageService.error('Lỗi hệ thống. Vui lòng thử lại sau!');
          }
        } else if (error.status === 403) {
          this.messageService.error('Bạn không có quyền thực hiện thao tác này.');
        } else if (error.status === 401) {
          this.messageService.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else {
          this.messageService.error('Không thể tải dữ liệu. Vui lòng thử lại!');
        }

        return of({ data: { content: [], totalElements: 0, totalPages: 0 } });
      }),
      finalize(() => {
        this.loadingDataTable = false;
        this.refreshCheckedStatus();
      })
    );
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
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


  // --- ACTION METHODS ---

  exportFile(): void {
    this.isExporting = true;
    // MOCK - Giả lập export file
    setTimeout(() => {
      this.isExporting = false;
      this.messageService.success('Xuất file thành công! (Mock)');
    }, 1000);
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


  // --- APPROVE/REJECT SINGLE ITEM ---

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


  // --- APPROVE/REJECT LIST ---

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
}
