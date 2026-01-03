import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DatePipe } from '@angular/common';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { ImportDataService } from '../import-data.service';
import { importAttendanceColumns } from './import-attendance.columns';

@Component({
  selector: 'app-import-attendance',
  templateUrl: './import-attendance.component.html',
  styleUrls: ['./import-attendance.component.scss'],
  providers: [DatePipe]
})
export class ImportAttendanceComponent implements OnInit {
  columns = importAttendanceColumns();
  data: any[] = [];
  loading = false;
  isVisible = false;
  pageIndex = 1;
  pageSize = 5;
  total = 0;
  pagedData: any[] = [];

  selectedMonth: Date | null = new Date();
  selectedFile: File | null = null;
  fileList: NzUploadFile[] = [];

  constructor(
    private importAttendanceService: ImportDataService,
    private message: NzMessageService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    if (!this.selectedMonth) return;
    const formattedMonth = this.datePipe.transform(this.selectedMonth, 'yyyy-MM');
    if (!formattedMonth) return;

    this.loading = true;
    this.importAttendanceService.getMyAttendanceApi(formattedMonth).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.data = res?.content || []; // Assuming API returns 'content'
        this.total = res?.totalElements || 0;
        this.updatePagedData();
      },
      error: () => {
        this.loading = false;
        this.data = [];
        this.updatePagedData();
        // console.error(err);
      }
    });
  }

  updatePagedData() {
    const start = (this.pageIndex - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedData = this.data.slice(start, end);
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.selectedFile = file as unknown as File;
    this.fileList = [file];
    return false; // Prevent auto upload
  };

  showModal(): void {
    this.isVisible = true;
  }

  handleCancel(): void {
    this.isVisible = false;
    this.selectedFile = null;
    this.fileList = [];
  }

  importFile() {
    if (!this.selectedMonth) {
      this.message.warning('Vui lòng chọn tháng!');
      return;
    }
    if (!this.selectedFile) {
      this.message.warning('Vui lòng chọn file!');
      return;
    }

    const formattedMonth = this.datePipe.transform(this.selectedMonth, 'yyyy-MM');
    if (!formattedMonth) {
      this.message.error('Lỗi định dạng tháng!');
      return;
    }

    this.loading = true;
    this.importAttendanceService.importAttendance(formattedMonth, this.selectedFile).subscribe({
      next: () => {
        this.message.success('Import dữ liệu công thành công!');
        this.loading = false;
        this.isVisible = false;
        this.selectedFile = null;
        this.fileList = [];
        this.loadData(); // Refresh data after import
      },
      error: (error: any) => {
        this.message.error('Import thất bại: ' + (error.error?.message || 'Lỗi không xác định'));
        this.loading = false;
      }
    });
  }

  onPageIndexChange(index: number) {
    this.pageIndex = index;
    this.updatePagedData();
  }
}
