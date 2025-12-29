import { Component, OnInit } from '@angular/core';
import { importAttendanceColumns } from './import-attendance.column';

@Component({
  selector: 'app-import-attendance',
  templateUrl: './import-attendance.component.html',
  styleUrls: ['./import-attendance.component.scss']
})
export class ImportAttendanceComponent implements OnInit {
  columns = importAttendanceColumns();
  data: any[] = [
    {
      index: 1,
      userName: 'NV001',
      fullName: 'Nguyễn Văn A',
      month: '12',
      year: '2025',
      day: '28'
    },
    {
      index: 2,
      userName: 'NV002',
      fullName: 'Trần Thị B',
      month: '12',
      year: '2025',
      day: '27'
    },
    {
      index: 3,
      userName: 'NV003',
      fullName: 'Lê Văn C',
      month: '12',
      year: '2025',
      day: '26'
    },
    {
      index: 4,
      userName: 'NV004',
      fullName: 'Phạm Thị D',
      month: '12',
      year: '2025',
      day: '25'
    },
    {
      index: 5,
      userName: 'NV005',
      fullName: 'Hoàng Văn E',
      month: '12',
      year: '2025',
      day: '24'
    },
    {
      index: 6,
      userName: 'NV006',
      fullName: 'Đỗ Thị F',
      month: '12',
      year: '2025',
      day: '23'
    },
    {
      index: 7,
      userName: 'NV007',
      fullName: 'Vũ Văn G',
      month: '12',
      year: '2025',
      day: '22'
    },
    {
      index: 8,
      userName: 'NV008',
      fullName: 'Ngô Thị H',
      month: '12',
      year: '2025',
      day: '21'
    },
    {
      index: 9,
      userName: 'NV009',
      fullName: 'Bùi Văn I',
      month: '12',
      year: '2025',
      day: '20'
    },
    {
      index: 10,
      userName: 'NV010',
      fullName: 'Phan Thị K',
      month: '12',
      year: '2025',
      day: '19'
    },
    {
      index: 11,
      userName: 'NV011',
      fullName: 'Lý Văn L',
      month: '12',
      year: '2025',
      day: '18'
    },
    {
      index: 12,
      userName: 'NV012',
      fullName: 'Tạ Thị M',
      month: '12',
      year: '2025',
      day: '17'
    }
  ];
  loading = false;
  pageIndex = 1;
  pageSize = 5;
  total = this.data.length;
  pagedData = this.data.slice(0, this.pageSize);

  constructor() { }

  ngOnInit(): void {
    this.updatePagedData();
    console.log('columns:', this.columns);
    console.log('pagedData:', this.pagedData);
  }

  updatePagedData() {
    const start = (this.pageIndex - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedData = this.data.slice(start, end);
  }

  importFile() {
    // TODO: Implement import logic
  }

  onPageIndexChange(index: number) {
    this.pageIndex = index;
    this.updatePagedData();
  }
}
