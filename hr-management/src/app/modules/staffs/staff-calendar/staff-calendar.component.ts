import { Component, OnInit } from '@angular/core';
import { StaffsService } from '../staffs.service';
import { CheckInOutData, AttendanceStatus, SpecialSchedule } from '../staffs-model';

@Component({
  selector: 'app-staff-calendar',
  templateUrl: './staff-calendar.component.html',
  styleUrls: ['./staff-calendar.component.scss']
})
export class StaffCalendarComponent implements OnInit {
  loading = false;
  selectedDate: Date = new Date();
  isHideDatePicker = true;
  isTimekeepingDateExporting = false;
  totalActualDays = 0;
  isShowSpecialSchedulePopover = false;

  dataCheckInOut: CheckInOutData[] = [];
  attendanceData: Map<string, AttendanceStatus> = new Map();
  specialSchedules: SpecialSchedule[] = [];

  stats = {
    totalPaidMinutes: 0,
    totalWorkingDays: 0,
    totalOTMinutes: 0,
    totalOTHours: 0,
    annualLeaveQuota: 0,
    annualLeaveUsed: 0,
    annualLeaveRemaining: 0
  };

  constructor(private staffsService: StaffsService) { }

  ngOnInit() {
    this.loadAttendanceData();
    this.loadSpecialSchedules();
  }

  loadSpecialSchedules() {
    this.staffsService.getMySpecialSchedules(0, 10).subscribe((res: any) => {
      if (res && res.content) {
        this.specialSchedules = res.content;
      } else {
        this.specialSchedules = [];
      }
    });
  }

  loadAttendanceData() {
    this.loading = true;
    this.staffsService.getMyAttendance(this.selectedDate).subscribe((res: any) => {
      const data = res.days || res.data || [];

      this.dataCheckInOut = [];
      this.attendanceData.clear();
      this.specialSchedules = [];

      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          const dateStr = item.date;
          if (dateStr) {
            if (item.checkIn || item.checkOut) {
              this.dataCheckInOut.push({
                time_date: dateStr,
                in_time: item.checkIn ? item.checkIn.slice(0, 5) : null,
                out_time: item.checkOut ? item.checkOut.slice(0, 5) : null
              });
            }

            if (item.display) {
              const upperDisplay = item.display.toUpperCase();
              let color = item.color || this.getColorByStatus(upperDisplay);

              if (item.checkIn && item.checkOut) {
                color = this.calculateWorkColor(item.checkIn, item.checkOut);
              }

              this.attendanceData.set(dateStr, {
                statusCode: upperDisplay,
                color: color
              });
            }
          }
        });
      }

      // Map stats from response
      this.stats.totalWorkingDays = res.totalWorkingDays ?? 0;
      this.stats.totalOTMinutes = res.totalOTMinutes ?? 0;
      this.stats.totalOTHours = res.totalOTHours ?? 0;
      this.stats.annualLeaveQuota = res.annualLeaveQuota ?? 0;
      this.stats.annualLeaveUsed = res.annualLeaveUsed ?? 0;
      this.stats.annualLeaveRemaining = res.annualLeaveRemaining ?? 0;

      this.loading = false;
    }, (err) => {
      this.loading = false;
    });
  }

  getColorByStatus(status: string): string {
    if (status.startsWith('X')) return '#00ff00';
    if (status.startsWith('RV')) return '#EE0033';
    if (status.startsWith('Ro')) return '#00ff00';
    if (status.startsWith('P')) return '#F59E0B';
    if (status.startsWith('L')) return '#00ff00';
    return '#D1D3D8';
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
    this.loadAttendanceData();
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
  }

  onDateLeave() {
  }

  showSpecialSchedule(visible: boolean) {
    this.isShowSpecialSchedulePopover = visible;
  }

  calculateWorkColor(checkIn: string, checkOut: string): string {
    if (!checkIn || !checkOut) return '#D1D3D8';

    const inParts = checkIn.split(':').map(Number);
    const outParts = checkOut.split(':').map(Number);

    if (inParts.length < 2 || outParts.length < 2) return '#D1D3D8';

    const inMinutes = inParts[0] * 60 + inParts[1];
    const outMinutes = outParts[0] * 60 + outParts[1];

    const diffMinutes = outMinutes - inMinutes;

    if (diffMinutes >= 480) { // >= 8 hours
      return '#00ff00';
    } else {
      return '#F59E0B'; // < 8 hours
    }
  }
}
