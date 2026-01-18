export interface LeaveManageModel {
  id?: number;
  employeeId?: number;
  employeeName?: string;
  employeeUserName?: string;
  employeeEmail?: string;
  organizationName?: string;
  departmentName?: string;
  type?: string;
  leaveDate?: string;
  duration?: string;
  durationCode?: string;
  absenceTypeCode?: string;
  absenceTypeName?: string;
  timeRegisterStart?: string; // Opt to keep for now or remove? Plan said "remove obsolete". I'll remove them.
  timeRegisterEnd?: string;
  absenceReason?: string;
  absenceStatus?: string;
  departmentId?: number;
  approvalUserId?: number;
  checked?: boolean;
  [key: string]: any; // Add index signature for dynamic access
}

export interface LeaveSearchFilters {
  employeeUserName: string;
  employeeName: string;
  employeeEmail: string;
  departmentName: string;
  absenceTypeName: string | null;
  startDate: Date | null;
  endDate: Date | null;
  timeRegisterStart: string;
  timeRegisterEnd: string;
  absenceStatus: string | null;
  absenceReason: string;
}

export interface LeavePaging {
  totalElements: number;
  pageSize: number;
  pageIndex: number;
}


