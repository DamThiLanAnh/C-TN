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
  timeRegisterEnd?: string;
  absenceReason?: string;
  absenceStatus?: string;
  organizationId?: number;
  approvalUserId?: number;
  checked?: boolean;
}
