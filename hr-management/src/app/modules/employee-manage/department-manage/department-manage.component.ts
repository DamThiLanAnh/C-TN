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

  fullDataList: any[] = []; // Cache for client-side filtering

  ngOnInit(): void {
    this.setupStreamSearch();
    this.fetchDataFromServer();
  }

  private setupStreamSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.paging.pageIndex = 1; // Reset to first page on search
      this.filterLocalData();
    });
  }

  private fetchDataFromServer(): void {
    this.loadingTable = true;
    // For initial fetch, we want all data. 
    // If backend supports pagination but we want client-side filter, we might need a large size or a specific 'all' endpoint.
    // Assuming /api/departments/active returns a list or we request a large page.
    const params = {
      page: 0,
      size: 1000 // Request large size to get all active departments for client side filtering
    };

    this.departmentManageService.getDepartmentsApi(params).pipe(
      finalize(() => this.loadingTable = false)
    ).subscribe(
      (response) => {
        console.log('API Department Response:', response);

        if (Array.isArray(response)) {
          this.fullDataList = response;
        } else if (response && response.content) {
          this.fullDataList = response.content;
        } else {
          this.fullDataList = [];
        }

        this.filterLocalData();
      },
      (error) => {
        this.messageService.error('Không thể tải danh sách phòng ban: ' + (error.error || error.message || 'Error'));
        this.listOfData = [];
        this.fullDataList = [];
        this.paging.totalElements = 0;
      }
    );
  }

  private filterLocalData(): void {
    let processedData = [...this.fullDataList];

    // Client-side filtering logic
    if (this.searchFilters['code']) {
      const code = this.searchFilters['code'].toLowerCase().trim();
      processedData = processedData.filter((item: any) => item.code && item.code.toLowerCase().includes(code));
    }
    if (this.searchFilters['name']) {
      const name = this.searchFilters['name'].toLowerCase().trim();
      processedData = processedData.filter((item: any) => item.name && item.name.toLowerCase().includes(name));
    }
    if (this.searchFilters['description']) {
      const description = this.searchFilters['description'].toLowerCase().trim();
      processedData = processedData.filter((item: any) => item.description && item.description.toLowerCase().includes(description));
    }
    if (this.searchFilters['status']) {
      const isLookingForActive = this.searchFilters['status'] === 'ACTIVE';
      processedData = processedData.filter((item: any) => {
        if (item.active !== undefined && item.active !== null) return item.active === isLookingForActive;
        if (item.isActive !== undefined && item.isActive !== null) return Boolean(item.isActive) === isLookingForActive;
        if (item.status === 1 || item.status === '1' || item.status === 'ACTIVE') return isLookingForActive;
        if (item.status === 0 || item.status === '0' || item.status === 'INACTIVE') return !isLookingForActive;
        return true;
      });
    }

    // Update Total based on filtered result
    const total = processedData.length;
    this.paging.totalElements = total;
    this.paging.totalPages = Math.ceil(total / this.paging.pageSize) || 1;

    // Client-side pagination
    const start = (this.paging.pageIndex - 1) * this.paging.pageSize;
    const end = start + this.paging.pageSize;
    const slicedData = processedData.slice(start, end);

    this.mapData(slicedData);
  }

  private loadData(): void {
    // Alias for backward compatibility if needed, or just redirect to fetch
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
      this.filterLocalData();
    }
  }

  getChangePagination(page: number): void {
    this.paging.pageIndex = page;
    this.filterLocalData();
  }

  onPageSizeChange(size: number): void {
    this.paging.pageSize = size;
    this.paging.pageIndex = 1;
    this.filterLocalData();
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
