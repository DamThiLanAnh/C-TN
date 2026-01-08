import { Component, OnInit } from '@angular/core';
import { DashboardService, DashboardOverview } from './dashboard.service';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentMonth: Date = new Date();
  overviewData: DashboardOverview | null = null;
  isLoading = false;
  error: string | null = null;

  // Chart Configs
  public barChartType: 'bar' = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];

  // 1. Attendance Chart
  public attendanceChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Công'],
    datasets: [
      { data: [0], label: 'Số ngày làm việc' },
      { data: [0], label: 'Đi muộn' }
    ]
  };
  public attendanceChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Thống kê Chấm công'
      }
    }
  };

  // 2. Overtime Chart
  public overtimeChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Tăng ca'],
    datasets: [
      { data: [0], label: 'Tổng giờ OT' }
    ]
  };
  public overtimeChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Thống kê Tăng ca'
      }
    }
  };

  // 3. Salary Chart
  public salaryChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Lương'],
    datasets: [
      { data: [0], label: 'Tổng lương chi trả' },
      { data: [0], label: 'Lương OT' }
    ]
  };
  public salaryChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Thống kê Lương (VNĐ)'
      }
    }
  };

  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
    this.loadOverview();
  }

  onMonthChange(result: Date): void {
    if (result) {
      this.currentMonth = result;
      this.loadOverview();
    }
  }

  loadOverview(): void {
    this.isLoading = true;
    const monthStr = `${this.currentMonth.getFullYear()}-${(this.currentMonth.getMonth() + 1).toString().padStart(2, '0')}`;

    this.dashboardService.getOverview(monthStr).subscribe(
      (data) => {
        this.overviewData = data;
        this.updateCharts(data);
        this.isLoading = false;
        this.error = null;
      },
      (error) => {
        console.error('Error loading dashboard data', error);
        this.error = 'Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.';
        this.isLoading = false;
      }
    );
  }

  updateCharts(data: DashboardOverview): void {
    // Update Attendance
    this.attendanceChartData = {
      labels: ['Chấm công'],
      datasets: [
        { data: [data.attendance.totalWorkingDays], label: 'Ngày làm việc', backgroundColor: '#1890ff' },
        { data: [data.attendance.lateCount], label: 'Lượt đi muộn', backgroundColor: '#ff4d4f' }
      ]
    };

    // Update Overtime
    this.overtimeChartData = {
      labels: ['Tăng ca'],
      datasets: [
        { data: [data.overtime.totalOtHours], label: 'Tổng giờ OT', backgroundColor: '#faad14' }
      ]
    };

    // Update Salary
    this.salaryChartData = {
      labels: ['Lương'],
      datasets: [
        { data: [data.salary.totalPaidSalary], label: 'Tổng chi trả', backgroundColor: '#52c41a' },
        { data: [data.salary.totalOtSalary], label: 'Chi trả OT', backgroundColor: '#13c2c2' }
      ]
    };
  }
}
