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

  constructor(private staffsService: StaffsService) { }

  ngOnInit() {
    this.loadAttendanceData();
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
               this.attendanceData.set(dateStr, {
                 statusCode: upperDisplay,
                 color: item.color || this.getColorByStatus(upperDisplay)
               });
             }
          }
        });
      }

      this.calculateTotalActualDays();
      this.loading = false;
    }, (err) => {
      this.loading = false;
    });
  }

  getColorByStatus(status: string): string {
    if (status.startsWith('X')) return '#52c41a'; // Green
    if (status.startsWith('M')) return '#faad14'; // Orange (Muộn)
    if (status.startsWith('P')) return '#1890ff'; // Blue (Phép)
    if (status.startsWith('L')) return '#ff4d4f'; // Red (Lễ)
    return '#d9d9d9'; // Gray
  }

  calculateTotalActualDays() {
    let count = 0;

    this.dataCheckInOut.forEach((record) => {
      if (record.in_time && record.out_time) {
        const workedHours = this.calculateWorkedHours(record.in_time, record.out_time);

        if (workedHours >= 8) {
          count += 1;
        } else if (workedHours >= 4) {
          count += 0.5;
        }
      }
    });

    this.totalActualDays = count;
  }

  calculateWorkedHours(checkIn: string, checkOut: string): number {
    const [inHour, inMinute] = checkIn.split(':').map(Number);
    const [outHour, outMinute] = checkOut.split(':').map(Number);

    const inTotalMinutes = inHour * 60 + inMinute;
    const outTotalMinutes = outHour * 60 + outMinute;

    const workedMinutes = outTotalMinutes - inTotalMinutes;
    const workedHours = workedMinutes / 60;

    return workedHours;
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
}
