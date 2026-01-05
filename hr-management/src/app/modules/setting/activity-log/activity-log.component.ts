import { Component, OnInit } from '@angular/core';
import { SettingService } from '../setting.service';
import { activityLogColumns } from './activity-log.columns';

@Component({
  selector: 'app-activity-log',
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.scss']
})
export class ActivityLogComponent implements OnInit {
  auditLogs: any[] = [];
  page = 0;
  size = 1000;
  total = 0;
  loading = false;
  columns = activityLogColumns();
  filters: any = {};
  sort = 'createdAt,desc';
  sortKey = 'date';
  sortValue = 'descend';

  displayData: any[] = [];
  pageIndex = 1;
  pageSize = 10;

  constructor(private settingService: SettingService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.settingService.getAuditLogs(0, this.size, {}).subscribe((res: any) => {
      this.loading = false;
      let data = res.content || res.data || [];

      if (Object.keys(this.filters).length > 0) {
          data = data.filter((item: any) => {
              for (const key in this.filters) {
                  if (this.filters.hasOwnProperty(key)) {
                      const filterVal = this.filters[key].toLowerCase();

                      if (key === 'date') {
                          if (!item.createdAt || !item.createdAt.startsWith(this.filters[key])) {
                              return false;
                          }
                          continue; 
                      } else if (key === 'time') {
                          if (!item.createdAt) return false;
                          const date = new Date(item.createdAt);
                          const hours = date.getHours().toString().padStart(2, '0');
                          const minutes = date.getMinutes().toString().padStart(2, '0');
                          const timeStr = `${hours}:${minutes}`;
                          
                          if (timeStr !== this.filters[key]) {
                              return false;
                          }
                          continue;
                      } else {
                          let itemVal = item[key] ? String(item[key]).toLowerCase() : '';
                          if (!itemVal.includes(filterVal)) {
                              return false;
                          }
                      }
                  }
              }
              return true;
          });
      }
      
      this.sortDataLocally(data);

      this.auditLogs = data;
      this.total = data.length;
      this.updateDisplayData();
    }, (err) => {
      this.loading = false;
    });
  }

  sortDataLocally(data: any[]) {
      const multiplier = this.sortValue === 'descend' ? -1 : 1;
      const columnKey = this.sortKey === 'date' ? 'createdAt' : this.sortKey;

      data.sort((a, b) => {
          let valA = a[columnKey];
          let valB = b[columnKey];

          if (columnKey === 'createdAt') {
              valA = new Date(valA).getTime();
              valB = new Date(valB).getTime();
          } else if (typeof valA === 'string') {
               valA = valA.toLowerCase();
               valB = valB.toLowerCase();
          }

          if (valA < valB) return -1 * multiplier;
          if (valA > valB) return 1 * multiplier;
          return 0;
      });
  }

  onSortChange(sortOrder: string | null, columnKey: string) {
      this.sortKey = columnKey;
      this.sortValue = sortOrder || '';

      if (columnKey === 'date') columnKey = 'createdAt'; 

      if (!sortOrder) {
          this.sortKey = 'date';
          this.sortValue = 'descend';
      }
      
      this.sortDataLocally(this.auditLogs);
      this.auditLogs = [...this.auditLogs];
      this.updateDisplayData();
  }

  updateDisplayData() {
    const startIndex = (this.pageIndex - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayData = this.auditLogs.slice(startIndex, endIndex);
  }

  onPageIndexChange(index: number) {
    this.pageIndex = index;
    this.updateDisplayData();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.pageIndex = 1; // Reset to first page when size changes
    this.updateDisplayData();
  }

  onSearch(filterValue: string, columnKey: string) {
      if (filterValue) {
          this.filters[columnKey] = filterValue;
      } else {
          delete this.filters[columnKey];
      }
      this.loadData();
  }

  onDateFilterChange(date: Date, columnKey: string) {
      if (date) {
          const formattedDate = date.toLocaleDateString('en-CA');
          this.filters[columnKey] = formattedDate;
      } else {
          delete this.filters[columnKey];
      }
      this.loadData();
  }

  onTimeFilterChange(time: Date, columnKey: string) {
      if (time) {
          const hours = time.getHours().toString().padStart(2, '0');
          const minutes = time.getMinutes().toString().padStart(2, '0');
          this.filters[columnKey] = `${hours}:${minutes}`;
      } else {
          delete this.filters[columnKey];
      }
      this.loadData();
  }
}
