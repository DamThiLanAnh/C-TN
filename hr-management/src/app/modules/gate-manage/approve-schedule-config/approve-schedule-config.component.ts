import { Component, OnInit } from '@angular/core';

interface ApproveScheduleConfigData {
  id: number;
  department: string;
  approver1: string;
  approver2: string;
  status: string;
}

@Component({
  selector: 'app-approve-schedule-config',
  templateUrl: './approve-schedule-config.component.html',
  styleUrls: ['./approve-schedule-config.component.scss']
})
export class ApproveScheduleConfigComponent implements OnInit {
  listOfData: ApproveScheduleConfigData[] = [];
  loadingTable = false;

  constructor() { }

  ngOnInit(): void {
    this.loadMockData();
  }

  loadMockData(): void {
    this.listOfData = [
      {
        id: 1,
        department: 'Phòng IT',
        approver1: 'Nguyễn Văn A',
        approver2: 'Trần Thị B',
        status: 'Đang hoạt động'
      },
      {
        id: 2,
        department: 'Phòng Kế toán',
        approver1: 'Lê Văn C',
        approver2: 'Phạm Thị D',
        status: 'Đang hoạt động'
      }
    ];
  }
}
