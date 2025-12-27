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
    private specialScheduleService: SpecialScheduleService,
    private authService: AuthService
  ) {
    this.rejectForm = this.fb.group({
      reason: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    console.log('SpecialScheduleComponent initialized');
    console.log('Columns:', this.columns);

    // Check token validity
    const token = this.authService.getToken();
    console.log('🔐 Current token:', token ? token.substring(0, 30) + '...' : 'NULL');

    if (token) {
      // Decode and check expiration
      try {
        const parts = token.split('.');
        const payload = JSON.parse(atob(parts[1]));
        const exp = new Date(payload.exp * 1000);
        const isExpired = Date.now() > payload.exp * 1000;

        console.log('🔐 Token expires at:', exp.toLocaleString());
        console.log('🔐 Token is expired:', isExpired);

        if (isExpired) {
          console.error('❌ TOKEN IS EXPIRED! Please login again.');
          this.messageService.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          // Optional: redirect to login
          // this.router.navigate(['/login']);
          return;
        }
      } catch (e) {
        console.error('❌ Error decoding token:', e);
      }
    } else {
      console.error('❌ NO TOKEN FOUND! Please login.');
      this.messageService.error('Vui lòng đăng nhập để tiếp tục.');
      return;
    }

    // Detect user role
    const userRole = this.authService.getUserRole();
    console.log('🔍 User role detected:', userRole);

    this.isEmployee = userRole === 'ROLE_EMPLOYEE' || userRole === 'EMPLOYEE';

    // Adjust UI based on role
    if (this.isEmployee) {
      this.tableName = 'Lịch làm đặc thù của tôi';
      this.canApprove = false; // Employees cannot approve
      console.log('👤 Employee mode: canApprove = false');
    } else {
      this.canApprove = true; // Managers/Admins can approve
      console.log('👔 Manager/Admin mode: canApprove = true');
    }

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
    // Convert page from 1-based (frontend) to 0-based (backend)
    const pageIndex = payload.page || this.paging.pageIndex;
    return {
      page: pageIndex - 1, // Backend expects 0-based page index
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

    // CRITICAL: Check token before making API call
    const currentToken = this.authService.getToken();
    console.log('🔐🔐🔐 TOKEN CHECK BEFORE API CALL 🔐🔐🔐');
    console.log('Token exists:', !!currentToken);
    console.log('Full token:', currentToken);

    if (currentToken) {
      try {
        const parts = currentToken.split('.');
        const payload_token = JSON.parse(atob(parts[1]));
        const exp = new Date(payload_token.exp * 1000);
        const isExpired = Date.now() > payload_token.exp * 1000;
        console.log('Token subject (user):', payload_token.sub);
        console.log('Token expires at:', exp.toLocaleString());
        console.log('Is expired:', isExpired ? '❌ YES - THIS IS THE PROBLEM!' : '✅ NO');

        if (isExpired) {
          this.messageService.error('Token đã hết hạn! Vui lòng đăng nhập lại.');
          this.loadingDataTable = false;
          return of({ content: [], totalElements: 0, totalPages: 0 });
        }
      } catch (e) {
        console.error('❌ Error decoding token:', e);
      }
    } else {
      console.error('❌ NO TOKEN! This will cause 403 error!');
      this.messageService.error('Không tìm thấy token. Vui lòng đăng nhập lại.');
      return of({ content: [], totalElements: 0, totalPages: 0 });
    }

    this.loadingDataTable = true;
    this.bodyPayload = this.getBodyByPayload(payload);
    this.paramPayload = this.getParamByPayload(payload);

    // Choose API based on user role
    let apiCall: Observable<any>;

    if (this.isEmployee) {
      // Employee: use GET /special-schedules/my
      // Backend has been configured to allow EMPLOYEE access (confirmed with 200 response)
      console.log('🔵 Calling API getMySpecialSchedulesApi (employee) with params:', this.paramPayload);
      console.log('✅ Backend allows /my endpoint for EMPLOYEE (tested and working!)');
      apiCall = this.specialScheduleService.getMySpecialSchedulesApi(this.paramPayload);
    } else {
      // Manager/Admin: use POST /special-schedules/search
      console.log('🔵 Calling API searchApi (manager/admin) with body:', this.bodyPayload, 'params:', this.paramPayload);
      apiCall = this.specialScheduleService.searchApi(this.bodyPayload, this.paramPayload);
    }

    return apiCall.pipe(
      tap((response: any) => {
        console.log('✅ API Response:', response);

        // Map API response to table data
        // Note: API returns content directly, not wrapped in "data" object (same as leave API)
        const content = response?.content || response?.data?.content || [];
        this.listOfData = content.map(
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
        this.paging.totalElements = response?.totalElements || response?.data?.totalElements || 0;
        this.paging.totalPages = response?.totalPages || response?.data?.totalPages || 0;

        console.log('✅ Mapped list data:', this.listOfData);
      }),
      catchError(error => {
        console.error('❌ ===== API ERROR DETAILS =====');
        console.error('Status:', error.status);
        console.error('Status Text:', error.statusText);
        console.error('Error object:', error);
        console.error('Error.error:', error.error);
        console.error('Error message:', error.message);
        console.error('Error headers:', error.headers);

        // Try to get response body
        if (error.error) {
          if (typeof error.error === 'string') {
            console.error('Response body (string):', error.error);
          } else if (typeof error.error === 'object') {
            console.error('Response body (object):', JSON.stringify(error.error, null, 2));
          }
        }

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
          console.error('❌ 403 Forbidden - This might be a backend permission issue, not token issue!');
        } else if (error.status === 401) {
          this.messageService.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else {
          this.messageService.error('Không thể tải dữ liệu. Vui lòng thử lại!');
        }

        return of({ content: [], totalElements: 0, totalPages: 0 });
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

  debugToken(): void {
    const currentToken = localStorage.getItem('token');
    const workingToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJiZW52IiwiaWF0IjoxNzY2ODI3MDAwLCJleHAiOjE3NjY4Mjg4MDB9.H60KuWpMsC5YY8cGT5XMu-Vwlb6LH9yEXXqX1mOBfnM';

    console.log('🔧 ===== DEBUG TOKEN =====');
    console.log('Current token:', currentToken);
    console.log('Working token:', workingToken);
    console.log('Tokens match:', currentToken === workingToken);

    if (!currentToken) {
      const setToken = confirm('❌ Không có token trong localStorage!\n\nBạn có muốn set token hoạt động từ Postman không?');
      if (setToken) {
        localStorage.setItem('token', workingToken);
        this.messageService.success('✅ Token đã được set! Đang reload data...');
        this.loadData();
      }
    } else if (currentToken !== workingToken) {
      const replaceToken = confirm('⚠️ Token hiện tại KHÁC với token hoạt động!\n\nCurrent: ' + currentToken.substring(0, 30) + '...\nWorking: ' + workingToken.substring(0, 30) + '...\n\nBạn có muốn thay thế bằng token hoạt động không?');
      if (replaceToken) {
        localStorage.setItem('token', workingToken);
        this.messageService.success('✅ Token đã được thay thế! Đang reload data...');
        this.loadData();
      }
    } else {
      // Check expiration
      try {
        const parts = currentToken.split('.');
        const payload = JSON.parse(atob(parts[1]));
        const exp = new Date(payload.exp * 1000);
        const isExpired = Date.now() > payload.exp * 1000;

        alert(`✅ Token hợp lệ và giống với Postman!\n\nUser: ${payload.sub}\nExpires: ${exp.toLocaleString()}\nStatus: ${isExpired ? '❌ ĐÃ HẾT HẠN' : '✅ CÒN HẠN'}\n\nNếu vẫn bị lỗi 403, vấn đề có thể là:\n1. Backend không cho phép user này truy cập\n2. CORS issue\n3. Interceptor có vấn đề`);
      } catch (e) {
        alert('❌ Lỗi decode token: ' + e);
      }
    }
  }

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
