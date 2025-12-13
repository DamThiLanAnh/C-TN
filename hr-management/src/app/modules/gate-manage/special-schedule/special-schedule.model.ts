export interface TimeModel {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}

export interface StaffModel {
  staffId: number;
  fullName: string;
  userName: string;
  email: string;
  organizationId: number;
  organizationName: string;
  organizationCode: string;
}

export interface ScheduleTypeModel {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  isDeleted: boolean;
  createdUser: string;
  createdDate: string;
  updatedUser: string;
  updatedDate: string;
}

export interface SpecialScheduleModel {
  id: number;
  staff: StaffModel;
  scheduleType: ScheduleTypeModel;
  beginDate: string;
  endDate: string;
  morningStart: TimeModel;
  morningEnd: TimeModel;
  afternoonStart: TimeModel;
  afternoonEnd: TimeModel;
  status: string;
  reasonDetail: string;
}

export interface SpecialScheduleSearchDTOModel {
  size: number
  page: number
  sortBy: string
  sortDirection: string
}
