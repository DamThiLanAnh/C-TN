export interface SpecialScheduleDetail {
  id: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  departmentId: number;
  departmentName: string;
  startDate: string;
  endDate: string;
  morningStart: string;
  morningEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
  projectCode?: string | null;
  projectName?: string | null;
  managerCode?: string | null;
  managerName?: string | null;
  type: string;
  reason: string;
  status: string;
  approverId?: number;
  decidedBy?: string | null;
  decidedAt?: string | null;
  createdAt?: string;
  // UI only
  checked?: boolean;
  disabled?: boolean;
  isActiveAction?: boolean;
  index?: number;
  [key: string]: any;
}
