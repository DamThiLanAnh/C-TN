import { Component, OnInit, OnDestroy } from '@angular/core';
import { formatDate } from '@angular/common';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { EmployeeAddComponent } from '../employee-add/employee-add.component';
import { EmployeeManageService } from '../employee-manage.service';
import { finalize, debounceTime, takeUntil } from 'rxjs/operators';
import { employeeManageColumns } from '../employee-manage.columns';
import { StandardColumnType } from '../../shares/interfaces';
import { Subject } from 'rxjs';

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
  searchSubject = new Subject<any>();
  filterChanged$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  listOfData: any[] = [];
  filteredData: any[] = []; // Data for table display after filter/pagination
  loadingTable = false;

  // Permissions
  canAdd = true;
  canEdit = true;
  canDelete = true;
  canTransferPosition = true;

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
    private employeeService: EmployeeManageService

  ) { }

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.paging.pageIndex = 1;
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
      statusCol.filter.options = [
        { label: 'Hoạt động', value: 'ACTIVE' },
        { label: 'Ngừng hoạt động', value: 'INACTIVE' }
      ];
    }

    // Gender Options
    const genderCol = this.employeeColumns.find(c => c.name === 'gender');
    if (genderCol && genderCol.filter) {
      genderCol.filter.options = [
        { label: 'Nam', value: 'Nam' },
        { label: 'Nữ', value: 'Nữ' },
        { label: 'Khác', value: 'Khác' }
      ];
    }

    const positionCol = this.employeeColumns.find(c => c.name === 'position');
    if (positionCol && positionCol.filter) {
      positionCol.filter.options = [
        { label: 'TV', value: 'TV' },
        { label: 'CV', value: 'CV' },
        { label: 'CVC', value: 'CVC' },
        { label: 'CVCC', value: 'CVC' },
        { label: 'TP', value: 'TP' }


      ];
    }
  }

  loadData(): void {
    this.loadingTable = true;

    // Fetch all (large size) for client-side filtering
    // Note: If real server-side pagination is wanted, we'd use params.
    // User requested "sửa lại giao diện và phần filter" ref "leave-manage" which does client side.
    this.employeeService.getEmployees(0, 1000)
      .pipe(finalize(() => this.loadingTable = false))
      .subscribe({
        next: (response: any) => {
          if (response?.content) {
            const sortedContent = [...response.content].sort((a, b) => {
              const codeA = a.code || '';
              const codeB = b.code || '';
              const numA = parseInt(codeA.replace(/\D/g, '')) || 0;
              const numB = parseInt(codeB.replace(/\D/g, '')) || 0;
              return numB - numA;
            });

            this.listOfData = sortedContent.map((item: any, index: number) => ({
              ...item,
              index: index + 1, // Global index?
              userName: item.code,
              fullName: item.fullName,
              email: item.email,
              phone: item.phoneNumber,
              phoneNumber: item.phoneNumber,
              workPositionName: item.position,
              departmentName: item.departmentName,
              statusName: item.status,
              isActive: item.status === 'ACTIVE' ? 1 : 0,
              isEnableEdit: item.status !== 'INACTIVE',
              gender: item.gender,
              dateOfBirth: item.dateOfBirth,
              createdAt: item.createdAt ? formatDate(item.createdAt, 'dd/MM/yyyy', 'en-US') : '',
              createdAtOriginal: item.createdAt
            }));

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
      if (result?.success && isEdit) {
        this.loadingTable = true;

        this.employeeService.updateEmployee(itemData.id, result.data)
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

  addStaffPosition(_data: any): void {
    this.messageService.info('Chức năng chuyển đơn vị đang được phát triển (Mock)');
  }

  onPageIndexChange(pageIndex: number): void {
    this.paging.pageIndex = pageIndex;
  }

  onPageSizeChange(pageSize: number): void {
    this.paging.pageSize = pageSize;
    this.paging.pageIndex = 1;
  }

  onFilterInTable(_params: NzTableQueryParams): void {
    // Handle table filtering/sorting here if needed
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



