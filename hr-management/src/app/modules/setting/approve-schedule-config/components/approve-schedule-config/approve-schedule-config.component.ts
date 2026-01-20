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
  allUsers: any[] = [];
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
  currentApproverSubset: OptionItem[] = [];

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
        this.allUsers = res.users?.content || [];
        const allUsers = this.allUsers;

        // Staff Options: Show all users
        this.staffOptions = allUsers.map((u: any) => ({
          label: u.username,
          value: u.id
        }));

        // Approver Options: Show all users initially (filtered dynamically)
        this.approverOptions = allUsers.map((u: any) => ({
          label: u.username,
          value: u.id
        }));

        // 2. Process Existing Configurations
        this.configList = [];
        if (res.configs?.content) {
          this.totalElements = res.configs.totalElements || 0;
          res.configs.content.forEach((item: any) => {
            // Ensure staff option exists
            if (!this.staffOptions.find(opt => opt.value === item.employeeId)) {
              this.staffOptions.push({
                label: item.targetUsername || item.employeeName,
                value: item.employeeId
              });
            }

            // Ensure approver option exists
            if (!this.approverOptions.find(opt => opt.value === item.approverId)) {
              this.approverOptions.push({
                label: item.approverUsername || item.approverName,
                value: item.approverId
              });
            }

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
    this.isLoading = true;
    const requests: any[] = [];

    // existing pairs from originalConfigList to avoid re-creating
    const existingPairs = new Set<string>();
    this.originalConfigList.forEach(row => {
      row.staffIds.forEach(sId => {
        row.approverIds.forEach(aId => {
          existingPairs.add(`${sId}-${aId}`);
        });
      });
    });

    this.configList.forEach(row => {
      row.staffIds.forEach(staffId => {
        const staff = this.allUsers.find(u => u.id === staffId);
        if (staff) {
          row.approverIds.forEach(approverId => {
            const approver = this.allUsers.find(u => u.id === approverId);
            if (approver) {
              const pairKey = `${staffId}-${approverId}`;

              // Only create if it didn't exist before
              if (!existingPairs.has(pairKey)) {
                const payload = {
                  targetType: 'EMPLOYEE',
                  targetCode: staff.empCode, // Assuming empCode exists
                  approverCode: approver.empCode
                };
                requests.push(this.approveScheduleConfigService.createPersonalApprovalConfig(payload));
              }
            }
          });
        }
      });
    });

    if (requests.length > 0) {
      forkJoin(requests)
        .pipe(finalize(() => {
          this.isLoading = false;
          this.isEditMode = false;
          this.cdr.markForCheck();
        }))
        .subscribe({
          next: () => {
            // Show success message if you have a notification service injected, e.g. this.notification.success(...)
            console.log('New configs saved successfully');
            this.loadData();
          },
          error: (err) => {
            console.error('Error saving configs', err);
            // Handle error (maybe show notification)
          }
        });
    } else {
      this.isLoading = false;
      this.isEditMode = false;
      console.log('No new configurations to save.');
    }
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



  onStaffDropdownVisibleChange(visible: boolean, index: number): void {
    if (visible) {
      this.searchKeyword['staffIds'] = '';
      this.filterOption('staffIds');
    }
  }

  onApproverDropdownVisibleChange(visible: boolean, index: number): void {
    if (visible) {
      this.searchKeyword['approverIds'] = '';

      const currentRow = this.configList[index];
      const selectedStaffIds = currentRow.staffIds || [];
      const selectedStaffs = this.allUsers.filter(u => selectedStaffIds.includes(u.id));

      const hasManagerSender = selectedStaffs.some(u => u.roles && u.roles.includes('MANAGER'));
      const targetRole = hasManagerSender ? 'HR' : 'MANAGER';

      const filteredApprovers = this.allUsers.filter(u => u.roles && u.roles.includes(targetRole));

      this.currentApproverSubset = filteredApprovers.map(u => ({
        label: u.username,
        value: u.id
      }));

      this.filteredOptions['approverIds'] = [...this.currentApproverSubset];
    } else {
      this.currentApproverSubset = [];
    }
  }



  filterOption(field: 'staffIds' | 'approverIds'): void {
    const keyword = this.searchKeyword[field].toLowerCase();

    let sourceOptions: OptionItem[] = [];
    if (field === 'staffIds') {
      sourceOptions = this.staffOptions;
    } else {
      // Use the subset if available/relevant, otherwise base
      sourceOptions = this.currentApproverSubset.length > 0 ? this.currentApproverSubset : this.approverOptions;
    }

    if (!keyword) {
      this.filteredOptions[field] = [...sourceOptions];
    } else {
      this.filteredOptions[field] = sourceOptions.filter(opt =>
        opt.label.toLowerCase().includes(keyword)
      );
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
