import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, finalize } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { StandardColumnModel, StandardColumnType } from '../../shares/interfaces';
import { certificatesManageColumns } from './certificates-manage.column';
import { CertificatesManageService } from './certificates-manage.service';
import { NzModalService } from 'ng-zorro-antd/modal';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-certificates-manage',
  templateUrl: './certificates-manage.component.html',
  styleUrls: ['./certificates-manage.component.scss']
})
export class CertificatesManageComponent implements OnInit {
  listOfData: any[] = [];
  tableName = 'Quản lý chứng chỉ';
  
  certificatesColumns: StandardColumnModel[] = [];
  public StandardColumnType = StandardColumnType;
  public isHR = false;

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

  fullDataList: any[] = []; // Cache for client-side filtering

  constructor(
    private messageService: NzMessageService,
    private certificatesManageService: CertificatesManageService,
    private modalService: NzModalService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    console.log('🔍 CertificatesManageComponent initialized');
    const userRole = this.authService.getUserRole();
    console.log('👤 User Role from AuthService:', userRole);
    this.isHR = this.authService.isHROrAdmin();
    console.log('🛡️ isHR evaluated to:', this.isHR);
    
    this.initColumns();
    console.log('📊 Columns initialized:', this.certificatesColumns.map(c => c.name));
    
    this.setupStreamSearch();
    this.fetchDataFromServer();
  }

  private initColumns(): void {
    const cols = certificatesManageColumns();
    if (!this.isHR) {
        this.certificatesColumns = cols.filter(c => c.name !== 'action');
    } else {
        this.certificatesColumns = cols;
    }
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
    const params = {
      page: 0,
      size: 20 
    };

    this.certificatesManageService.getCertificatesApi(params).pipe(
      finalize(() => this.loadingTable = false)
    ).subscribe(
      (response) => {
        console.log('API Certificates Response:', response);
        
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
        this.messageService.error('Không thể tải danh sách chứng chỉ: ' + (error.error || error.message || 'Error'));
        this.listOfData = [];
        this.fullDataList = [];
        this.paging.totalElements = 0;
      }
    );
  }

  private filterLocalData(): void {
    let processedData = [...this.fullDataList];

    // Client-side filtering logic
    if (this.searchFilters['employeeCode']) {
      const val = this.searchFilters['employeeCode'].toLowerCase().trim();
      processedData = processedData.filter((item: any) => item.employeeCode && item.employeeCode.toLowerCase().includes(val));
    }
    if (this.searchFilters['employeeName']) {
      const val = this.searchFilters['employeeName'].toLowerCase().trim();
      processedData = processedData.filter((item: any) => item.employeeName && item.employeeName.toLowerCase().includes(val));
    }
    if (this.searchFilters['name']) {
      const val = this.searchFilters['name'].toLowerCase().trim();
      processedData = processedData.filter((item: any) => item.name && item.name.toLowerCase().includes(val));
    }
    if (this.searchFilters['issuer']) {
      const val = this.searchFilters['issuer'].toLowerCase().trim();
      processedData = processedData.filter((item: any) => item.issuer && item.issuer.toLowerCase().includes(val));
    }
    if (this.searchFilters['issuedDate']) {
        const date = new Date(this.searchFilters['issuedDate']);
        const val = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        processedData = processedData.filter((item: any) => item.issuedDate && item.issuedDate.includes(val));
    }
    if (this.searchFilters['expiredDate']) {
        const date = new Date(this.searchFilters['expiredDate']);
        const val = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        processedData = processedData.filter((item: any) => item.expiredDate && item.expiredDate.includes(val));
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

  private mapData(data: any[]): void {
    this.listOfData = data.map((item, index) => {
      // No status mapping needed for certificates based on current requirements
      
      return {
        ...item,
        index: (this.paging.pageIndex - 1) * this.paging.pageSize + index + 1,
        isActiveAction: true
      };
    });
  }

  onFilterInTable(event: NzTableQueryParams): void {
    const { pageIndex, pageSize } = event;
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
        this.openAddCertificateModal(data.id, data);
        break;
      case 'delete':
        this.confirmDeleteCertificate(data);
        break;
      default:
        this.messageService.warning('Chức năng chưa hỗ trợ!');
    }
  }

  confirmDeleteCertificate(data: any): void {
    this.modalService.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa chứng chỉ <b>${data.name}</b> không?`,
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => this.deleteCertificate(data.id),
      nzCancelText: 'Hủy'
    });
  }

  deleteCertificate(id: number | string): void {
    this.certificatesManageService.deleteCertificateApi(id).subscribe(
      () => {
        this.messageService.success('Xóa chứng chỉ thành công!');
        this.fetchDataFromServer();
      },
      (error) => {
        this.messageService.error('Xóa chứng chỉ thất bại: ' + (error.error?.message || 'Lỗi hệ thống'));
      }
    );
  }

  openAddCertificateModal(id?: any, data?: any): void {
    // Placeholder for now as modal component is not created
    this.messageService.info('Chức năng thêm mới/sửa sẽ được cập nhật sau.');
    /*
    const modalRef = this.modalService.create({
      nzTitle: id ? 'Cập nhật chứng chỉ' : 'Thêm mới chứng chỉ',
      nzContent: ModalAddCertificateComponent,
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
    */
  }
}
