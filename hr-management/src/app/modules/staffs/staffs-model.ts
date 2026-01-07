export interface CheckInOutData {
  time_date: string;
  in_time: string | null;
  out_time: string | null;
}

export interface AttendanceStatus {
  statusCode: string;
  color: string;
}

export interface SpecialSchedule {
  displayBeginDate: Date;
  displayEndDate: Date;
  morningStart: string;
  morningEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
}

export interface EmployeeDetail {
  full_name: string;
  user_name: string;
  position_name: string;
  organization_name: string;
  dob: Date | null;
  gender: boolean;
  phone: string;
  email: string;
  status: number;
  entryDate: Date | null;
  siteName: string;
  universityName: string;
  majorEduName: string;
  eduLevelName: string;
}

export interface EmployeeSkill {
  id: number;
  skillName: string;
  level: number;
  category: string;
  experience: string;
}

export interface EmployeeReview {
  id: number;
  reviewDate: Date;
  reviewer: string;
  period: string;
  rating: number;
  comment: string;
}

export interface AttendanceResponse {
  days?: any[];
  data?: any[];
}

export interface EmployeeResponse {
  data?: any;
  fullName?: string;
  name?: string;
  username?: string;
  positionName?: string;
  position?: { name: string };
  departmentName?: string;
  organization?: { name: string };
  dateOfBirth?: string;
  gender?: string | boolean | number;
  phoneNumber?: string;
  phone?: string;
  email?: string;
  status?: number;
  createdAt?: string;
  siteName?: string;
  address?: string;
  universityName?: string;
  majorEduName?: string;
  eduLevelName?: string;
}

