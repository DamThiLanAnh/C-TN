export interface LeaveManageModel {
  id?: number;
  employeeId?: number;
  employeeName?: string;
  employeeUserName?: string;
  employeeEmail?: string;
  organizationName?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  absenceTypeCode?: string;
  absenceTypeName?: string;
  timeRegisterStart?: string;
  timeRegisterEnd?: string;
  absenceReason?: string;
  absenceStatus?: string;
  organizationId?: number;
  approvalUserId?: number;
  checked?: boolean;
  [key: string]: any; // Add index signature for dynamic access
}

export interface LeaveSearchFilters {
  employeeUserName: string;
  employeeName: string;
  employeeEmail: string;
  organizationName: string;
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


