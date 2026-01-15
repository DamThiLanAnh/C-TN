import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { StandardColumnModel, StandardColumnType } from '../../shares/interfaces';
import { departmentManageColumns } from './department-manage.columns';
import { DepartmentManageService } from './department-manage.service';
import { ModalAddDepartmentComponent } from './modal-add-department/modal-add-department.component';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-department-manage',
  templateUrl: './department-manage.component.html',
  styleUrls: ['./department-manage.component.scss']
})
export class DepartmentManageComponent implements OnInit {
  listOfData: any[] = [];
  tableName = 'Quản lý phòng ban';

  departmentColumns: StandardColumnModel[] = departmentManageColumns();
  public StandardColumnType = StandardColumnType;

  // Pagination
  paging = {
    pageIndex: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0
  };

  loadingTable = false;

  // Search stream
  public searchFilters: { [key: string]: any } = {};
  public searchSubject = new Subject<any>();

  constructor(
    private messageService: NzMessageService,
    private departmentManageService: DepartmentManageService,
    private modalService: NzModalService
  ) { }




  ngOnInit(): void {
    this.setupStreamSearch();
    this.fetchDataFromServer();
  }

  private setupStreamSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.paging.pageIndex = 1; // Reset to first page on search
      this.fetchDataFromServer();
    });
  }

  private fetchDataFromServer(): void {
    this.loadingTable = true;

    // Prepare params from paging and searchFilters
    const params = {
      page: this.paging.pageIndex - 1,
      size: this.paging.pageSize,
      ...this.searchFilters
    };

    this.departmentManageService.getDepartmentsApi(params).pipe(
      finalize(() => this.loadingTable = false)
    ).subscribe(
      (response) => {
        if (response && response.content) {
          this.mapData(response.content);
          this.paging.totalElements = response.totalElements || 0;
          this.paging.totalPages = response.totalPages || 0;
        } else {
          this.listOfData = [];
          this.paging.totalElements = 0;
        }
      },
      (error) => {
        this.messageService.error('Không thể tải danh sách phòng ban: ' + (error.error || error.message || 'Error'));
        this.listOfData = [];
        this.paging.totalElements = 0;
      }
    );
  }

  // filterLocalData removed

  private loadData(): void {
    this.fetchDataFromServer();
  }

  private mapData(data: any[]): void {
    this.listOfData = data.map((item, index) => {
      let status = item.status;

      // Normalize 'active' field from backend to 'status' for table display
      if (item.active !== undefined && item.active !== null) {
        status = item.active ? 'ACTIVE' : 'INACTIVE';
      } else {
        // Fallback normalization
        if (status === undefined || status === null) {
          if (item.isActive === true || item.isActive === 1) status = 'ACTIVE';
          else if (item.isActive === false || item.isActive === 0) status = 'INACTIVE';
        }
        if (status === 1 || status === '1') status = 'ACTIVE';
        if (status === 0 || status === '0') status = 'INACTIVE';
      }

      return {
        ...item,
        // Calculate index based on page
        index: (this.paging.pageIndex - 1) * this.paging.pageSize + index + 1,
        status: status || 'ACTIVE',
        isActiveAction: true
      };
    });
  }

  onFilterInTable(event: NzTableQueryParams): void {
    const { pageIndex, pageSize } = event;
    // Only update if changed
    if (this.paging.pageIndex !== pageIndex || this.paging.pageSize !== pageSize) {
      this.paging.pageIndex = pageIndex;
      this.paging.pageSize = pageSize;
      this.fetchDataFromServer();
    }
  }

  getChangePagination(page: number): void {
    this.paging.pageIndex = page;
    this.fetchDataFromServer();
  }

  onPageSizeChange(size: number): void {
    this.paging.pageSize = size;
    this.paging.pageIndex = 1;
    this.fetchDataFromServer();
  }

  handleAction(actionKey: string, data: any): void {
    switch (actionKey) {
      case 'edit':
        this.openAddDepartmentModal(data.id, data);
        break;
      case 'delete':
        this.confirmDeleteDepartment(data);
        break;
      default:
        this.messageService.warning('Chức năng chưa hỗ trợ!');
    }
  }

  confirmDeleteDepartment(data: any): void {
    this.modalService.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa phòng ban <b>${data.name}</b> không?`,
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => this.deleteDepartment(data.id),
      nzCancelText: 'Hủy'
    });
  }

  deleteDepartment(id: number | string): void {
    this.departmentManageService.deleteDepartmentApi(id).subscribe(
      () => {
        this.messageService.success('Xóa phòng ban thành công!');
        this.fetchDataFromServer();
      },
      (error) => {
        this.messageService.error('Xóa phòng ban thất bại: ' + (error.error?.message || 'Lỗi hệ thống'));
      }
    );
  }

  openAddDepartmentModal(id?: any, data?: any): void {
    const modalRef = this.modalService.create({
      nzTitle: id ? 'Cập nhật phòng ban' : 'Thêm mới phòng ban',
      nzContent: ModalAddDepartmentComponent,
      nzFooter: null,
      nzWidth: 600,
      nzComponentParams: {
        id: id,
        data: data
      }
    });
    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.fetchDataFromServer();
      }
    });
  }
}
