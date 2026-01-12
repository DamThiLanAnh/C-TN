import { Component, OnInit } from '@angular/core';
import { StaffCostService } from './staff-cost.service';
import { staffCostColumns } from './staff-cost.columns';
import { StandardColumnModel } from '../shares/interfaces';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-staff-cost',
  templateUrl: './staff-cost.component.html',
  styleUrls: ['./staff-cost.component.scss']
})
export class StaffCostComponent implements OnInit {
  loading = false;
  columns: StandardColumnModel[] = staffCostColumns();
  data: any[] = [];

  pageIndex = 1;
  pageSize = 10;
  total = 0;

  searchFilters: any = {};
  filterChanged$ = new Subject<void>();

  originalData: any[] = [];

  isModalVisible = false;
  selectedSalary: any = null;

  constructor(private staffCostService: StaffCostService) {
    this.filterChanged$.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.applyFilter();
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;

    this.staffCostService.getMySalary(this.pageIndex - 1, this.pageSize).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.originalData = res?.content || [];
        this.total = res?.totalElements || 0;
        this.applyFilter();
      },
      error: () => {
        this.loading = false;
        this.data = [];
        this.originalData = [];
      }
    });
  }

  applyFilter() {
    const { title } = this.searchFilters;
    if (title) {
      this.data = this.originalData.filter(item =>
        item.title && item.title.toLowerCase().includes(title.toLowerCase())
      );
    } else {
      this.data = [...this.originalData];
    }
  }

  onPageIndexChange(index: number) {
    this.pageIndex = index;
    this.loadData();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadData();
  }

  onTableQueryParamsChange(params: any) {
    // Optional: Handle server-side sorting if needed, for now just basic load
  }

  onRowClick(row: any) {
    this.isModalVisible = true;
    this.selectedSalary = null;
    // Assuming row has month and year. If not, we might need to parse from another field or the API provides it.
    // Based on user request, we need to pass month and year.
    // If row.month and row.year are undefined, we might need to look at importedAt or similar.
    let month = row.month;
    let year = row.year;

    if (!month && row.importedAt) {
      const date = new Date(row.importedAt);
      if (!isNaN(date.getTime())) {
        month = date.getMonth() + 1;
        year = date.getFullYear();
      }
    }

    if (month && year) {
      this.staffCostService.getSalaryDetail(month, year).subscribe({
        next: (res) => {
          this.selectedSalary = res;
        },
        error: (err) => {
          console.error('Failed to load salary detail', err);
          this.selectedSalary = null;
        }
      });
    }
  }

  handleCancel() {
    this.isModalVisible = false;
  }
}
