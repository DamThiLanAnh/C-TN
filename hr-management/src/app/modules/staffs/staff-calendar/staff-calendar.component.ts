import { Component, OnInit } from '@angular/core';

interface CheckInOutData {
  time_date: string;
  in_time: string | null;
  out_time: string | null;
}

interface AttendanceStatus {
  statusCode: string;
  color: string;
}

interface SpecialSchedule {
  displayBeginDate: Date;
  displayEndDate: Date;
  morningStart: string;
  morningEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
}

@Component({
  selector: 'app-staff-calendar',
  templateUrl: './staff-calendar.component.html',
  styleUrls: ['./staff-calendar.component.scss']
})
export class StaffCalendarComponent implements OnInit {
  selectedDate: Date = new Date();
  isHideDatePicker = true;
  isTimekeepingDateExporting = false;
  totalActualDays = 0;
  isShowSpecialSchedulePopover = false;

  dataCheckInOut: CheckInOutData[] = [];
  attendanceData: Map<string, AttendanceStatus> = new Map();
  specialSchedules: SpecialSchedule[] = [];

  ngOnInit() {
    this.loadMockData();
    this.calculateTotalActualDays();
  }

  loadMockData() {
    // Mock data cho check in/out
    const currentMonth = this.selectedDate.getMonth();
    const currentYear = this.selectedDate.getFullYear();

    // Tạo dữ liệu chấm công cho 20 ngày đầu tháng
    for (let day = 1; day <= 20; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Random check in/out times
      if (day % 7 !== 0) { // Không có dữ liệu cho chủ nhật
        this.dataCheckInOut.push({
          time_date: dateStr,
          in_time: this.getRandomTime(8, 9),
          out_time: this.getRandomTime(17, 18)
        });

        // Xác định trạng thái
        const hour = parseInt(this.getRandomTime(8, 9).split(':')[0]);
        if (hour <= 8) {
          this.attendanceData.set(dateStr, { statusCode: 'X', color: '#52c41a' }); // Đủ công
        } else if (hour <= 9) {
          this.attendanceData.set(dateStr, { statusCode: 'X', color: '#faad14' }); // Đi muộn
        }
      }
    }

    // Thêm một số trường hợp đặc biệt
    const date15 = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`;
    this.attendanceData.set(date15, { statusCode: 'P', color: '#1890ff' }); // Nghỉ phép

    const date16 = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-16`;
    this.attendanceData.set(date16, { statusCode: 'Xon', color: '#722ed1' }); // Làm online

    const date22 = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-22`;
    this.attendanceData.set(date22, { statusCode: 'CT', color: '#13c2c2' }); // Công tác

    // Mock special schedules
    this.specialSchedules = [
      {
        displayBeginDate: new Date(currentYear, currentMonth, 1),
        displayEndDate: new Date(currentYear, currentMonth, 15),
        morningStart: '08:00',
        morningEnd: '12:00',
        afternoonStart: '13:30',
        afternoonEnd: '17:30'
      },
      {
        displayBeginDate: new Date(currentYear, currentMonth, 16),
        displayEndDate: new Date(currentYear, currentMonth + 1, 0),
        morningStart: '08:30',
        morningEnd: '12:00',
        afternoonStart: '13:00',
        afternoonEnd: '17:00'
      }
    ];
  }

  getRandomTime(startHour: number, endHour: number): string {
    const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
    const minute = Math.floor(Math.random() * 60);
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  calculateTotalActualDays() {
    this.totalActualDays = this.dataCheckInOut.filter(d =>
      this.attendanceData.get(d.time_date)?.statusCode === 'X'
    ).length;
  }

  viewPreMonth() {
    const newDate = new Date(this.selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    this.selectedDate = newDate;
    this.refreshData();
  }

  viewNextMonth() {
    const newDate = new Date(this.selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    this.selectedDate = newDate;
    this.refreshData();
  }

  selectChange(date: Date) {
    this.selectedDate = date;
    this.isHideDatePicker = true;
    this.refreshData();
  }

  refreshData() {
    this.dataCheckInOut = [];
    this.attendanceData.clear();
    this.loadMockData();
    this.calculateTotalActualDays();
  }

  getAttendanceStatusForDate(date: Date): AttendanceStatus | null {
    const dateStr = this.formatDateToString(date);
    return this.attendanceData.get(dateStr) || null;
  }

  getDotColor(date: Date): string {
    const status = this.getAttendanceStatusForDate(date);
    return status?.color || '#d9d9d9';
  }

  hasCheckInOutData(date: Date): boolean {
    const dateStr = this.formatDateToString(date);
    return this.dataCheckInOut.some(d => d.time_date === dateStr);
  }

  checkDate(date: Date, timeDate: string): boolean {
    const dateStr = this.formatDateToString(date);
    return dateStr === timeDate;
  }

  formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatTimeDisplay(time: string | null): string {
    return time || '--:--';
  }

  formatTime(time: string): string {
    return time;
  }

  onDateHover(date: Date, event: MouseEvent) {
    // Handle hover event if needed
  }

  onDateLeave() {
    // Handle leave event if needed
  }

  showSpecialSchedule(visible: boolean) {
    this.isShowSpecialSchedulePopover = visible;
  }

  // exportTimekeepingData() {
  //   this.isTimekeepingDateExporting = true;
  //
  //   // Simulate export
  //   setTimeout(() => {
  //     console.log('Exporting timekeeping data...', {
  //       month: this.selectedDate,
  //       totalDays: this.totalActualDays,
  //       data: this.dataCheckInOut
  //     });
  //     this.isTimekeepingDateExporting = false;
  //     alert('Dữ liệu đã được export thành công!');
  //   }, 2000);
  // }
}
