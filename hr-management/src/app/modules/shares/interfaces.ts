export enum StandardColumnType {
  TEXT = 0, // Dùng cho trường hợp không rõ loại hoặc TEXT
  INPUT = 1,
  SELECT = 2,
  DATE_RANGE_PICKER = 3,
  TIME_RANGE_PICKER = 4,
  TAG = 5,
  ACTION = 6,
  INPUT_NUMBER = 7,
}

export interface FilterConfig {
  type?: StandardColumnType;
  options?: any[];
  name?: string;
  multiple?: boolean;
  // Thay thế selectOptionsType (EnumSelectOptionType) bằng một trường chuẩn hơn hoặc xóa bỏ
}

export interface ActionConfig {
  key: string;
  icon?: string;
  label: string;
  html?: string; // Thay thế IconHtml
  rules?: string[];
  fieldCheckShow?: string;
}

export interface StandardColumnModel {
  id: number;
  name: string;
  attr: string; // Tiêu đề cột
  type: StandardColumnType | number;
  width?: string;
  isFilter?: boolean;
  isSort?: boolean;
  filter?: FilterConfig;
  fixedColumn?: boolean;
  fixedRight?: boolean;
  isRequire?: boolean;
  classes?: string;

  // Các trường đặc thù của thư viện cũ có thể giữ lại hoặc bỏ:
  rulesAction?: {
    isEdit?: string[];
    isRemove?: string[];
  };
  listAction?: ActionConfig[];
  indexColumn?: boolean;
  // Bỏ các trường như configGroupName, isInputAdd, isDisabled, addItem, insertIndex, searchIndex, checked, action nếu không cần dùng
}

export interface StandardFormItemModel {
  field: string;
  label: string;
  type: StandardColumnType | number; // Sử dụng lại StandardColumnType
  multiple?: boolean;
  options?: any[];
  // Thêm các thuộc tính Form khác nếu cần thiết (placeholder, validation,...)
}

export const RequestStatus = [
  { value: 1, label: 'Đã duyệt' },
  { value: 2, label: 'Chờ duyệt' },
  { value: 3, label: 'Từ chối' },
];
