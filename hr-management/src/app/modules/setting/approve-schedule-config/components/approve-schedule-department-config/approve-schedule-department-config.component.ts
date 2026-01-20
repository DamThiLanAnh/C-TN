import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApproveScheduleConfigService } from '../../approve-schedule-config.service';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

interface DepartmentConfigRow {
  departmentIds: number[];
  approveStaffIds: number[];
}

interface OptionItem {
  label: string;
  value: number;
}

@Component({
  selector: 'app-approve-schedule-department-config',
  templateUrl: './approve-schedule-department-config.component.html',
  styleUrls: ['./approve-schedule-department-config.component.scss']
})
export class ApproveScheduleDepartmentConfigComponent implements OnInit {
  isEditMode = false;
  isLoading = false;
  rolesCanEdit = ['ADMIN', 'HR'];

  configList: DepartmentConfigRow[] = [];
  departmentOptions: OptionItem[] = [];
  staffOptions: OptionItem[] = [];

  filteredOptions: { [key: string]: OptionItem[] } = {
    departmentIds: [],
    approveStaffIds: []
  };

  searchKeyword: { [key: string]: string } = {
    departmentIds: '',
    approveStaffIds: ''
  };

  private originalConfigList: DepartmentConfigRow[] = [];

  constructor(
    private approveScheduleConfigService: ApproveScheduleConfigService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    forkJoin({
      configs: this.approveScheduleConfigService.getDepartmentApprovalConfigs(0, 1000),
      departments: this.approveScheduleConfigService.getAllDepartments(0, 1000),
      users: this.approveScheduleConfigService.getAllUsers(0, 1000)
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe(res => {
        // 1. Setup Department Options
        this.departmentOptions = (res.departments?.content || []).map((d: any) => ({
          label: d.name,
          value: d.id
        }));

        // 2. Setup User Options (Approvers)
        // User requested "userName của các manager".
        this.staffOptions = (res.users?.content || [])
          .filter((u: any) => u.roles && u.roles.includes('MANAGER'))
          .map((u: any) => ({
            label: u.username,
            value: u.id
          }));

        // 3. Process Existing Configs
        this.configList = [];
        if (res.configs?.content) {
          res.configs.content.forEach((item: any) => {
            // We can use the existing data, but options are now master data from APIs
            // Handle potential null approver
            const approverIds: number[] = [];
            if (item.approverId) {
              approverIds.push(item.approverId);
            }

            this.configList.push({
              departmentIds: [item.departmentId],
              approveStaffIds: approverIds
            });
          });
        }

        this.originalConfigList = JSON.parse(JSON.stringify(this.configList));
        this.initFilteredOptions();
      });
  }

  /* loadMockData removed */

  initFilteredOptions(): void {
    this.filteredOptions['departmentIds'] = [...this.departmentOptions];
    this.filteredOptions['approveStaffIds'] = [...this.staffOptions];
  }

  onEdit(): void {
    this.isEditMode = true;
    this.originalConfigList = JSON.parse(JSON.stringify(this.configList));
  }

  onCancelEdit(): void {
    this.isEditMode = false;
    this.configList = JSON.parse(JSON.stringify(this.originalConfigList));
    this.searchKeyword = { departmentIds: '', approveStaffIds: '' };
    this.initFilteredOptions();
  }

  onSaveEdit(): void {
    this.isEditMode = false;
    // TODO: Call API to save changes if needed
    console.log('Saving department config changes...', this.configList);
    this.originalConfigList = JSON.parse(JSON.stringify(this.configList));
  }

  addRow(): void {
    this.configList.push({
      departmentIds: [],
      approveStaffIds: []
    });
  }

  removeRow(index: number): void {
    this.configList.splice(index, 1);
  }

  onAddValue(row: DepartmentConfigRow, field: 'departmentIds' | 'approveStaffIds', value: number): void {
    if (!row[field].includes(value)) {
      row[field].push(value);
    }
  }

  removeOptionId(row: DepartmentConfigRow, field: 'departmentIds' | 'approveStaffIds', id: number): void {
    const index = row[field].indexOf(id);
    if (index > -1) {
      row[field].splice(index, 1);
    }
  }

  getOptionLabel(id: number, field: 'departmentIds' | 'approveStaffIds'): string {
    const sourceOptions = field === 'departmentIds' ? this.departmentOptions : this.staffOptions;
    const option = sourceOptions.find(opt => opt.value === id);
    return option ? option.label : `ID: ${id}`;
  }

  filterOption(field: 'departmentIds' | 'approveStaffIds'): void {
    const keyword = this.searchKeyword[field].toLowerCase();
    const sourceOptions = field === 'departmentIds' ? this.departmentOptions : this.staffOptions;

    if (!keyword) {
      this.filteredOptions[field] = [...sourceOptions];
    } else {
      this.filteredOptions[field] = sourceOptions.filter(opt =>
        opt.label.toLowerCase().includes(keyword)
      );
    }
  }

  onDepartmentDropdownVisibleChange(visible: boolean, index: number): void {
    if (visible) {
      this.searchKeyword['departmentIds'] = '';
      this.filterOption('departmentIds');
    }
  }

  onStaffDropdownVisibleChange(visible: boolean, index: number): void {
    if (visible) {
      this.searchKeyword['approveStaffIds'] = '';
      this.filterOption('approveStaffIds');
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
