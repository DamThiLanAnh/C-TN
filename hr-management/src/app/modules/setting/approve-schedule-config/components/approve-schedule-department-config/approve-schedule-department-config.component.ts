import { Component, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit(): void {
    this.loadMockData();
  }

  loadMockData(): void {
    // Mock department data
    this.departmentOptions = [
      { label: 'Phòng IT', value: 1 },
      { label: 'Phòng Kế toán', value: 2 },
      { label: 'Phòng Nhân sự', value: 3 },
      { label: 'Phòng Kinh doanh', value: 4 },
      { label: 'Phòng Marketing', value: 5 },
      { label: 'Phòng Hành chính', value: 6 },
      { label: 'Chi nhánh Hà Nội', value: 7 },
      { label: 'Chi nhánh TP.HCM', value: 8 },
      { label: 'Chi nhánh Đà Nẵng', value: 9 }
    ];

    // Mock staff data
    this.staffOptions = [
      { label: 'Nguyễn Văn Manager A', value: 101 },
      { label: 'Trần Thị Leader B', value: 102 },
      { label: 'Lê Văn Director C', value: 103 },
      { label: 'Phạm Thị Supervisor D', value: 104 },
      { label: 'Hoàng Văn Admin E', value: 105 },
      { label: 'Vũ Thị Manager F', value: 106 },
      { label: 'Đặng Văn Leader G', value: 107 }
    ];

    // Mock config data
    this.configList = [
      {
        departmentIds: [1, 2],
        approveStaffIds: [101, 102]
      },
      {
        departmentIds: [3, 4],
        approveStaffIds: [103]
      },
      {
        departmentIds: [7, 8],
        approveStaffIds: [104, 105]
      }
    ];

    this.originalConfigList = JSON.parse(JSON.stringify(this.configList));
    this.initFilteredOptions();
  }

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
    // TODO: Call API to save changes
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
