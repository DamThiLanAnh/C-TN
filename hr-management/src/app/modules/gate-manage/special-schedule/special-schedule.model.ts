export interface SpecialScheduleDetail {
  id: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  departmentId: number;
  departmentName: string;
  startDate: string;
  endDate: string;
  morningStart: string | null;
  morningEnd: string | null;
  afternoonStart: string | null;
  afternoonEnd: string | null;
  type: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approverId: number | null;
  decidedBy: string | null;
  decidedAt: string | null;
  createdAt: string;
}

export interface SpecialScheduleListItem {
  id: string | number;
  index: number;
  userName: string;
  fullName: string;
  scheduleType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  beginDate: string;
  endDate: string;
  checked: boolean;
  disabled: boolean;
  isActiveAction: boolean;
  [key: string]: any;
}

