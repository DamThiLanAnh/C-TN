import { Component, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { EmployeeAddComponent } from '../employee-add/employee-add.component';
import { EmployeeManageService } from '../employee-manage.service';
import { finalize } from 'rxjs/operators';

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
export class EmployeeManageComponent implements OnInit {
  tableName = 'Danh sách nhân viên';
  columns: TableColumn[] = [
    { title: 'Mã nhân viên', key: 'userName', width: '150px', sortable: true },
    { title: 'Họ và tên', key: 'fullName', width: '200px', sortable: true },
    { title: 'Email', key: 'email', width: '220px', sortable: true },
    { title: 'Số điện thoại', key: 'phone', width: '140px' },
    { title: 'Vị trí', key: 'workPositionName', width: '200px' },
    { title: 'Phòng ban', key: 'departmentName', width: '200px' },
    // { title: 'Trạng thái', key: 'isActive', width: '150px' }
  ];

  listOfData: any[] = [];
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
    this.loadData();
  }

  loadData(): void {
    this.loadingTable = true;

    const page = this.paging.pageIndex - 1;
    const size = this.paging.pageSize;

    this.employeeService.getEmployees(page, size)
      .pipe(finalize(() => this.loadingTable = false))
      .subscribe({
        next: (response: any) => {
          if (response?.content) {
            this.listOfData = response.content.map((item: any, index: number) => ({
              ...item,
              index: page * size + index + 1,
              userName: item.code,
              fullName: item.fullName,
              email: item.email,
              phone: item.phoneNumber,
              workPositionName: item.position,
              departmentName: item.departmentName,
              isActive: item.status === 'ACTIVE' ? 1 : 0,
              isEnableEdit: item.status !== 'INACTIVE'
            }));

            this.paging.totalElements = response.totalElements || 0;
            this.paging.totalPages = response.totalPages || 0;
          } else {
            this.listOfData = [];
            this.paging.totalElements = 0;
            this.paging.totalPages = 0;
            this.messageService.warning('Không có dữ liệu');
          }
        },
        error: (error) => {
          console.error('Error loading employees:', error);
          this.messageService.error('Không thể tải dữ liệu nhân viên. Vui lòng thử lại!');
          this.listOfData = [];
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
    this.loadData();
  }

  onPageSizeChange(pageSize: number): void {
    this.paging.pageSize = pageSize;
    this.paging.pageIndex = 1;
    this.loadData();
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
}

