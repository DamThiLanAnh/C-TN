import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApproveScheduleConfigService } from '../../approve-schedule-config.service';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

interface ConfigRow {
  staffIds: number[];
  approverIds: number[];
}

interface OptionItem {
  label: string;
  value: number;
}

@Component({
  selector: 'app-approve-schedule-config',
  templateUrl: './approve-schedule-config.component.html',
  styleUrls: ['./approve-schedule-config.component.scss']
})
export class ApproveScheduleConfigComponent implements OnInit {
  selectedTabIndex = 0;
  isEditMode = false;
  isLoading = false;
  personalRoles = ['ADMIN', 'MANAGER'];
  businessRoles = ['ADMIN', 'HR'];

  configList: ConfigRow[] = [];
  staffOptions: OptionItem[] = [];
  approverOptions: OptionItem[] = [];

  filteredOptions: { [key: string]: OptionItem[] } = {
    staffIds: [],
    approverIds: []
  };

  searchKeyword: { [key: string]: string } = {
    staffIds: '',
    approverIds: ''
  };

  // Pagination
  pageIndex = 1;
  pageSize = 5;
  totalElements = 0;

  private originalConfigList: ConfigRow[] = [];

  constructor(
    private approveScheduleConfigService: ApproveScheduleConfigService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    // Use forkJoin to load both configuration and list of all users
    forkJoin({
      configs: this.approveScheduleConfigService.getPersonalApprovalConfigs(this.pageIndex - 1, this.pageSize),
      users: this.approveScheduleConfigService.getAllUsers(0, 1000)
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe(res => {
        // 1. Process User List for Dropdowns
        const allUsers = res.users?.content || [];

        // Filter for 'User / Staff' (sender) - Role: MANAGER
        this.staffOptions = allUsers
          .filter((u: any) => u.roles && u.roles.includes('MANAGER'))
          .map((u: any) => ({
            label: u.username,
            value: u.id
          }));

        // Filter for 'Approver' (receiver) - Role: HR
        this.approverOptions = allUsers
          .filter((u: any) => u.roles && u.roles.includes('HR'))
          .map((u: any) => ({
            label: u.username,
            value: u.id
          }));

        // 2. Process Existing Configurations
        this.configList = [];
        if (res.configs?.content) {
          this.totalElements = res.configs.totalElements || 0;
          res.configs.content.forEach((item: any) => {
            this.configList.push({
              staffIds: [item.employeeId],
              approverIds: [item.approverId]
            });
          });
        } else {
          this.totalElements = 0;
        }

        this.originalConfigList = JSON.parse(JSON.stringify(this.configList));
        this.initFilteredOptions();
      });
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
    this.loadData();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1;
    this.loadData();
  }

  /* loadMockData removed */

  initFilteredOptions(): void {
    this.filteredOptions['staffIds'] = [...this.staffOptions];
    this.filteredOptions['approverIds'] = [...this.approverOptions];
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    this.isEditMode = false;
  }

  onEdit(): void {
    this.isEditMode = true;
    this.originalConfigList = JSON.parse(JSON.stringify(this.configList));
  }

  onCancelEdit(): void {
    this.isEditMode = false;
    this.configList = JSON.parse(JSON.stringify(this.originalConfigList));
    this.searchKeyword = { staffIds: '', approverIds: '' };
    this.initFilteredOptions();
  }

  onSaveEdit(): void {
    this.isEditMode = false;
    // TODO: Call API to save changes if needed
    console.log('Saving changes...', this.configList);
    this.originalConfigList = JSON.parse(JSON.stringify(this.configList));
  }

  addRow(): void {
    this.configList.push({
      staffIds: [],
      approverIds: []
    });
  }

  removeRow(index: number): void {
    this.configList.splice(index, 1);
  }

  onAddValue(row: ConfigRow, field: 'staffIds' | 'approverIds', value: number): void {
    if (!row[field].includes(value)) {
      row[field].push(value);
    }
  }

  removeOptionId(row: ConfigRow, field: 'staffIds' | 'approverIds', id: number): void {
    const index = row[field].indexOf(id);
    if (index > -1) {
      row[field].splice(index, 1);
    }
  }

  getOptionLabel(id: number): string {
    const allOptions = [...this.staffOptions, ...this.approverOptions];
    const option = allOptions.find(opt => opt.value === id);
    return option ? option.label : `ID: ${id}`;
  }

  filterOption(field: 'staffIds' | 'approverIds'): void {
    const keyword = this.searchKeyword[field].toLowerCase();
    const sourceOptions = field === 'staffIds' ? this.staffOptions : this.approverOptions;

    if (!keyword) {
      this.filteredOptions[field] = [...sourceOptions];
    } else {
      this.filteredOptions[field] = sourceOptions.filter(opt =>
        opt.label.toLowerCase().includes(keyword)
      );
    }
  }

  onStaffDropdownVisibleChange(visible: boolean, index: number): void {
    if (visible) {
      this.searchKeyword['staffIds'] = '';
      this.filterOption('staffIds');
    }
  }

  onApproverDropdownVisibleChange(visible: boolean, index: number): void {
    if (visible) {
      this.searchKeyword['approverIds'] = '';
      this.filterOption('approverIds');
    }
  }

  getViewportHeight(field: string): number {
    const options = this.filteredOptions[field];
    const itemHeight = 32;
    const maxHeight = 200;
    const calculatedHeight = options.length * itemHeight;
    return Math.min(calculatedHeight, maxHeight);
  }
}
