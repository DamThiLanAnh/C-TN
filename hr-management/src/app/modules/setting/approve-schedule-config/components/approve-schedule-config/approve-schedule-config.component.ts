import { Component, OnInit } from '@angular/core';

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

  private originalConfigList: ConfigRow[] = [];

  constructor() { }

  ngOnInit(): void {
    this.loadMockData();
  }

  loadMockData(): void {
    // Mock staff data
    this.staffOptions = [
      { label: 'Nguyễn Văn A', value: 1 },
      { label: 'Trần Thị B', value: 2 },
      { label: 'Lê Văn C', value: 3 },
      { label: 'Phạm Thị D', value: 4 },
      { label: 'Hoàng Văn E', value: 5 },
      { label: 'Vũ Thị F', value: 6 },
      { label: 'Đặng Văn G', value: 7 },
      { label: 'Mai Thị H', value: 8 }
    ];

    // Mock approver data
    this.approverOptions = [
      { label: 'Nguyễn Văn Manager', value: 101 },
      { label: 'Trần Thị Leader', value: 102 },
      { label: 'Lê Văn Director', value: 103 },
      { label: 'Phạm Thị Supervisor', value: 104 },
      { label: 'Hoàng Văn Admin', value: 105 }
    ];

    // Mock config data
    this.configList = [
      {
        staffIds: [1, 2],
        approverIds: [101]
      },
      {
        staffIds: [3, 4, 5],
        approverIds: [102, 103]
      }
    ];

    this.originalConfigList = JSON.parse(JSON.stringify(this.configList));
    this.initFilteredOptions();
  }

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
    // TODO: Call API to save changes
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
