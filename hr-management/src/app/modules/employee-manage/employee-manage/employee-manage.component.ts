import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { formatDate } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { EmployeeAddComponent } from '../employee-add/employee-add.component';
import { EmployeeManageService } from '../employee-manage.service';
import { finalize, debounceTime, takeUntil } from 'rxjs/operators';
import { employeeManageColumns } from './employee-manage.columns';
import { StandardColumnType } from '../../shares/interfaces';
import { Subject } from 'rxjs';
import { GenderOptions, PositionOptions, Status } from '../../shares/enum/options.constants';

// Simple column model cho nz-table
interface TableColumn {
  title: string;
  key: string;
  width: string;
  sortable?: boolean;
}

@Component({
  selector: 'app-employee-manage',
  templateUrl: './employee-manage.component.html',
  styleUrls: ['./employee-manage.component.scss']
})
export class EmployeeManageComponent implements OnInit, OnDestroy {
  tableName = 'Danh sách nhân viên';
  employeeColumns = employeeManageColumns();
  StandardColumnType = StandardColumnType;
  searchFilters: { [key: string]: any } = {};
  // searchSubject = new Subject<any>(); // Removed
  filterChanged$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  listOfData: any[] = [];
  filteredData: any[] = [];
  loadingTable = false;

  // Permissions
  canAdd = false;
  canEdit = false;
  canDelete = false;
  canTransferPosition = false;

  // Pagination
  paging = {
    pageIndex: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0
  };

  constructor(
    private modalService: NzModalService,
    private messageService: NzMessageService,
    private employeeService: EmployeeManageService,
    private elementRef: ElementRef,
    private authService: AuthService

  ) { }

  renderContainer = (): HTMLElement => {
    return this.elementRef.nativeElement;
  }


  ngOnInit(): void {
    // Check permissions
    const isHROrAdmin = this.authService.isHROrAdmin();
    this.canAdd = isHROrAdmin;
    this.canEdit = isHROrAdmin;
    this.canDelete = isHROrAdmin;
    this.canTransferPosition = isHROrAdmin;

    this.filterChanged$.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.paging.pageIndex = 1;
      this.onSearch();
    });

    this.loadDepartments();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDepartments(): void {
    this.employeeService.getAllDepartments(0, 1000).subscribe((res: any) => {
      const content = res.content || res;
      if (Array.isArray(content)) {
        const options = content.map((d: any) => ({ label: d.name, value: d.id })); // value is ID as per filter logic usually, or name? Leave manage used name. Service returns ID. Let's use name for filter matching if consistent, or ID if easier.
        // The data has departmentName (string). If I filter by ID, I need departmentId in data.
        // The data mapping has departmentName.
        // `leave-manage` uses `name` as value.
        // Let's check `getEmployees` response. Step 28: `departmentName: item.departmentName`.
        // So I should map options to label: name, value: name.
        const nameOptions = content.map((d: any) => ({ label: d.name, value: d.name }));

        // Update departments filter
        const deptCol = this.employeeColumns.find(c => c.name === 'departmentName');
        if (deptCol && deptCol.filter) {
          deptCol.filter.options = nameOptions;
        }
      }
    });

    // Mock positions options or fetch if API available. For now static or simple mock?
    // I will leave position options empty or try to extract from data if possible.

    // Status Options
    const statusCol = this.employeeColumns.find(c => c.name === 'statusName');
    if (statusCol && statusCol.filter) {
      statusCol.filter.options = Status;
    }

    // Gender Options
    const genderCol = this.employeeColumns.find(c => c.name === 'gender');
    if (genderCol && genderCol.filter) {
      // Map filter options to Nam/Nữ to match data
      genderCol.filter.options = [
        { label: 'Nam', value: 'Nam' },
        { label: 'Nữ', value: 'Nữ' }
      ];
    }

    const positionCol = this.employeeColumns.find(c => c.name === 'position');
    if (positionCol && positionCol.filter) {
      positionCol.filter.options = PositionOptions;
    }
  }

  loadData(): void {
    this.loadingTable = true;
    // Client-side pagination: Load 1000 items
    const page = 0;
    const size = 1000;

    this.employeeService.getEmployees(page, size, {})
      .pipe(finalize(() => this.loadingTable = false))
      .subscribe({
        next: (response: any) => {
          const content = response?.content || response;
          if (Array.isArray(content)) {
            this.listOfData = content.map((item: any, index: number) => ({
              id: item.id,
              code: item.code,
              fullName: item.fullName,
              dateOfBirth: item.dateOfBirth,
              gender: item.gender === 'MALE' ? 'Nam' : (item.gender === 'FEMALE' ? 'Nữ' : item.gender),
              citizenId: item.citizenId,
              address: item.address,
              position: item.position,
              workPositionName: item.position, // Keep alias for existing filters if needed, but user asked for "position" in data key. Column uses 'position' or?
              // Column key is 'position' but `workPositionName` was mapped before.
              // Let's check column definition: name: 'position'. So data should have 'position'.
              departmentId: item.departmentId,
              departmentName: item.departmentName,
              status: item.status,
              statusName: item.status, // Column uses `statusName` key. Keep both or ensure column matches.
              email: item.email,
              phoneNumber: item.phoneNumber,
              userId: item.userId,
              createdAt: item.createdAt ? formatDate(item.createdAt, 'dd/MM/yyyy', 'en-US') : '',
              createdAtOriginal: item.createdAt,

              // Extra mappings for table compatibility if columns expected other keys
              index: index + 1,
              userName: item.code, // Fallback if some code uses userName
              statusLabel: item.status // Or whatever logic
            }));

            // Initial search to set filteredData and paging
            this.onSearch();
            
          } else {
            this.listOfData = [];
            this.filteredData = [];
            this.paging.totalElements = 0;
            this.messageService.warning('Không có dữ liệu');
          }
        },
        error: (error) => {
          console.error('Error loading employees:', error);
          this.messageService.error('Không thể tải dữ liệu nhân viên. Vui lòng thử lại!');
          this.listOfData = [];
          this.filteredData = [];
        }
      });
  }

  onSearch(): void {
    const matches = this.listOfData.filter(item => {
      // Filter by Code (userName)
      if (this.searchFilters['code'] && !item.userName?.toLowerCase().includes(this.searchFilters['code'].toLowerCase())) {
        return false;
      }
      // Filter by Name
      if (this.searchFilters['fullName'] && !item.fullName?.toLowerCase().includes(this.searchFilters['fullName'].toLowerCase())) {
        return false;
      }
      // Filter by Email
      if (this.searchFilters['email'] && !item.email?.toLowerCase().includes(this.searchFilters['email'].toLowerCase())) {
        return false;
      }
      // Filter by Phone
      if (this.searchFilters['phoneNumber'] && !item.phoneNumber?.toLowerCase().includes(this.searchFilters['phoneNumber'].toLowerCase())) {
        return false;
      }
      // Filter by Position
      if (this.searchFilters['position'] && this.searchFilters['position'].length > 0) {
        if (Array.isArray(this.searchFilters['position'])) {
           if (!this.searchFilters['position'].includes(item.workPositionName)) return false;
        } else {
           if (item.workPositionName !== this.searchFilters['position']) return false;
        }
      }
      // Filter by Department
      if (this.searchFilters['departmentName'] && this.searchFilters['departmentName'].length > 0) {
        if (Array.isArray(this.searchFilters['departmentName'])) {
           if (!this.searchFilters['departmentName'].includes(item.departmentName)) return false;
        } else {
           if (item.departmentName !== this.searchFilters['departmentName']) return false;
        }
      }
      // Filter by Status
      if (this.searchFilters['statusName'] && this.searchFilters['statusName'].length > 0) {
        if (Array.isArray(this.searchFilters['statusName'])) {
           if (!this.searchFilters['statusName'].includes(item.statusName)) return false;
        } else {
           if (item.statusName !== this.searchFilters['statusName']) return false;
        }
      }
      // Filter by Gender
      if (this.searchFilters['gender'] && this.searchFilters['gender'].length > 0) {
        if (Array.isArray(this.searchFilters['gender'])) {
           if (!this.searchFilters['gender'].includes(item.gender)) return false;
        } else {
           if (item.gender !== this.searchFilters['gender']) return false;
        }
      }

      // Filter by Date of Birth
      if (this.searchFilters['dateOfBirth']) {
        if (!this.checkDateMatch(item.dateOfBirth, this.searchFilters['dateOfBirth'])) {
          return false;
        }
      }

      // Filter by Created At (Joining Date)
      if (this.searchFilters['createdAt']) {
         // item.createdAtOriginal is the raw date string/object
        if (!this.checkDateMatch(item.createdAtOriginal, this.searchFilters['createdAt'])) {
          return false;
        }
      }

      return true;
    });

    this.paging.totalElements = matches.length;

    // Slicing for pagination
    const start = (this.paging.pageIndex - 1) * this.paging.pageSize;
    const end = start + this.paging.pageSize;
    this.filteredData = matches.slice(start, end);
  }

  checkDateInRange(dateValue: string | Date, fromDate: Date, toDate: Date): boolean {
    if (!dateValue || !fromDate) return false; // Basic check
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return false;

    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0);

    const end = toDate ? new Date(toDate) : new Date(start); // If toDate null, assume single day? Or usually range picker enforces both.
    if (toDate) end.setHours(23, 59, 59, 999);

    return date >= start && date <= end;
  }

  checkDateMatch(dateValue: string | Date, filterDate: Date): boolean {
    if (!dateValue || !filterDate) return false;
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return false;

    const start = new Date(filterDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(filterDate);
    end.setHours(23, 59, 59, 999);

    return date >= start && date <= end;
  }



  addStaff(): void {
    const modal = this.modalService.create({
      nzTitle: 'Thêm mới nhân viên',
      nzContent: EmployeeAddComponent,
      nzWidth: '80%',
      nzFooter: null,
      nzComponentParams: {
        canEdit: true
      }
    });

    modal.afterClose.subscribe((result) => {
      if (result?.success) {
        this.loadingTable = true;

        this.employeeService.createEmployee(result.data)
          .pipe(finalize(() => this.loadingTable = false))
          .subscribe({
            next: () => {
              this.messageService.success('Thêm nhân viên thành công');
              // Reset to page 1 to show the newest employee at the top
              this.paging.pageIndex = 1;
              this.loadData();
            },
            error: (error) => {
              console.error('Error creating employee:', error);
              this.messageService.error('Thêm nhân viên thất bại. Vui lòng thử lại!');
            }
          });
      }
    });
  }

  editUser(event: { item: any }, isEdit: boolean = true): void {
    if (!isEdit) {
      this.loadingTable = true;
      this.employeeService.getEmployeeById(event.item.id)
        .pipe(finalize(() => this.loadingTable = false))
        .subscribe({
          next: (response) => {
            this.openEmployeeModal(response, isEdit);
          },
          error: (error) => {
            console.error('Error loading employee detail:', error);
            this.messageService.error('Không thể tải thông tin nhân viên!');
          }
        });
    } else {
      this.openEmployeeModal(event.item, isEdit);
    }
  }

  private openEmployeeModal(itemData: any, isEdit: boolean): void {
    const modal = this.modalService.create({
      nzTitle: isEdit ? 'Sửa thông tin nhân viên' : 'Xem thông tin nhân viên',
      nzContent: EmployeeAddComponent,
      nzWidth: '80%',
      nzFooter: null,
      nzComponentParams: {
        item: itemData,
        canEdit: isEdit
      }
    });

    modal.afterClose.subscribe((result) => {
      if (result?.success) {
        this.loadingTable = true;

        // Construct exact payload for update
        const payload = {
          fullName: result.data.fullName,
          dateOfBirth: result.data.dateOfBirth,
          gender: result.data.gender, // "OTHER" in example, logic handles MALE/FEMALE, OTHER comes from input or constant? GenderOptions has MALE/FEMALE. If user passes OTHER via API/curl, UI handles it? UI uses select. If user wants OTHER, option must exist. But for now I bind what is selected.
          address: result.data.address,
          position: result.data.position,
          departmentId: result.data.departmentId,
          phoneNumber: result.data.phoneNumber
        };

        this.employeeService.updateEmployee(itemData.id, payload)
          .pipe(finalize(() => this.loadingTable = false))
          .subscribe({
            next: () => {
              this.messageService.success('Cập nhật nhân viên thành công');
              this.loadData();
            },
            error: (error) => {
              console.error('Error updating employee:', error);
              this.messageService.error('Cập nhật nhân viên thất bại. Vui lòng thử lại!');
            }
          });
      }
    });
  }

  deleteStaff(data: any): void {
    this.loadingTable = true;

    // Call real delete API
    this.employeeService.deleteEmployee(data.id)
      .pipe(finalize(() => this.loadingTable = false))
      .subscribe({
        next: () => {
          this.messageService.success('Xóa nhân viên thành công');
          this.loadData();
        },
        error: (error) => {
          console.error('Delete Error:', error);
          this.messageService.error('Xóa nhân viên thất bại. Vui lòng thử lại!');
        }
      });
  }

  showConfirm(data: any): void {
    this.modalService.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa nhân viên <strong>${data.fullName || data.userName}</strong>?`,
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Hủy',
      nzIconType: 'exclamation-circle',
      nzWidth: 500,
      nzOnOk: () => {
        this.deleteStaff(data);
      }
    });
  }

  onPageIndexChange(pageIndex: number): void {
    this.paging.pageIndex = pageIndex;
    this.onSearch();
  }

  onPageSizeChange(pageSize: number): void {
    this.paging.pageSize = pageSize;
    this.paging.pageIndex = 1;
    this.onSearch();
  }

  onFilterInTable(_params: NzTableQueryParams): void {
    // Client-side filtering handled by onSearch.
  }

  /**
   * Get fallback key for data mapping
   * userName -> code, phone -> phoneNumber, etc.
   */
  getFallbackKey(key: string): string {
    const fallbackMap: { [key: string]: string } = {
      'userName': 'code',
      'phone': 'phoneNumber',
      'workPositionName': 'position',
      'organizationName': 'department'
    };
    return fallbackMap[key] || '';
  }

  /**
   * TrackBy function for better performance in *ngFor
   */
  trackByEmployeeId(_index: number, item: any): number {
    return item.id || _index;
  }

  /**
   * TrackBy function for columns
   */
  trackByColumnKey(_index: number, column: TableColumn): string {
    return column.key;
  }

  getTagColor(status: string): string {
    // Tùy chỉnh màu cho trạng thái
    switch (status) {
      case 'ACTIVE': return 'green';
      case 'INACTIVE': return 'red';
      default: return 'default';
    }
  }

  getTagLabel(status: string): string {
    // Tùy chỉnh label cho trạng thái
    switch (status) {
      case 'ACTIVE': return 'Hoạt động';
      case 'INACTIVE': return 'Ngừng hoạt động';
      default: return status;
    }
  }

  handleAction(actionKey: string, data: any): void {
    switch (actionKey) {
      case 'edit':
        this.editUser({ item: data });
        break;
      case 'delete':
        this.showConfirm(data);
        break;
      default:
        this.messageService.warning('Chức năng chưa hỗ trợ!');
    }
  }

  getDisplayValue(data: any, key: string): string {
    const value = data[key];
    if (value === null || value === undefined) {
      return '-';
    }
    return value;
  }
}



