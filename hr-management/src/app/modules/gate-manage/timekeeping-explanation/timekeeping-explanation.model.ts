export interface TimekeepingExplanationModel {
  id?: number;
  employeeId?: number;
  employeeName?: string;
  employeeUserName?: string;
  employeeEmail?: string;
  departmentName?: string;
  workDate?: string;
  checkInTime?: string;
  checkOutTime?: string;
  proposedCheckIn?: string;
  proposedCheckOut?: string;
  reason?: string;
  status?: string;
  approvalDate?: string;
  approverName?: string;
  rejectReason?: string;
  checked?: boolean;
  [key: string]: any;
}

export interface TimekeepingExplanationFilters {
  employeeUserName: string;
  employeeName: string;
  employeeEmail: string;
  departmentName: string;
  fromDate: Date | null;
  toDate: Date | null;
  status: string | null;
  reason: string;
}

export interface TimekeepingExplanationPaging {
  totalElements: number;
  pageSize: number;
  pageIndex: number;
}

