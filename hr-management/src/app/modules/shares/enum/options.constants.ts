import { OptionModel } from '../models/option.model';

export const StatusOptions: OptionModel[] = [
  {
    label: 'Hiệu lực',
    value: 1,
  },
  {
    label: 'Hết hiệu lực',
    value: 0,
  },
];
export const Status: OptionModel[] = [
  {
    label: 'Hoạt động',
    value: 1,
    color: '#14804A',
  },
  {
    label: 'Không hoạt động',
    value: 0,
    color: '#667085',
  },
];
export const StatusDelete: OptionModel[] = [
  {
    label: 'Đã xóa',
    value: 1,
    color: 'red',
  },
  {
    label: 'Chưa xóa',
    value: 0,
    color: '#14804A',
  },
];

export const CusType: OptionModel[] = [
  {
    label: 'Tiềm năng',
    value: 1,
  },
  {
    label: 'Chính thức',
    value: 2,
  },
  {
    label: 'Trung thành',
    value: 3,
  },
];

export const statusJira: OptionModel[] = [
  {
    label: 'Success',
    value: 'Success',
    color: 'green',
  },
  {
    label: 'Failed',
    value: 'Failed',
    color: 'red',
  },
  {
    label: 'Pending',
    value: 'Pending',
    color: '#ff861d',
  },
];
export const StaffStatus: OptionModel[] = [
  {
    label: 'Hoạt động',
    value: 1 || true,
    color: '#14804A',
  },
  {
    label: 'Không hoạt động',
    value: 0 || false,
    color: '#667085',
  },
];

export const ManagerStatus: OptionModel[] = [
  {
    label: 'Quản lý',
    value: true,
    color: '#14804A',
  },
  {
    label: 'Nhân viên',
    value: false,
    color: '#667085',
  },
];

export const StatusCV: OptionModel[] = [
  {
    label: 'Hoàn thành',
    value: 'COMPLETED',
    color: '#039855',
  },
  {
    label: 'Chưa cập nhật',
    value: 'NOT_UPDATED',
    color: '#F59E0B',
  },
  {
    label: 'Đã hủy yêu cầu',
    value: 'CANCELLED',
    color: '#EE0033',
  },
];

export const OptionDataDefault: OptionModel[] = [
  {
    value: false,
    label: 'Dữ liệu mặc định',
  },
  {
    value: true,
    label: 'Dữ liệu đã xóa',
  },
];
export const revType: OptionModel[] = [
  {
    label: 'Thêm mới',
    value: 0,
    color: '#147541',
  },
  {
    label: 'Xóa',
    value: 2,
    color: '#EE0033',
  },
  {
    label: 'Cập nhật',
    value: 1,
    color: '#FF861D',
  },
];
export const PAStatus: OptionModel[] = [
  {
    label: 'Hoàn thành',
    value: 3,
    color: '#147541',
  },
  {
    label: 'Đang xử lý',
    value: 2,
    color: '#FF861D',
  },
  {
    label: 'Chưa xử lý',
    value: 1,
    color: '#EE0033',
  },
];

export const DataTypeAttr: OptionModel[] = [
  {
    label: 'Textbox',
    value: 'Textbox',
  },
  {
    label: 'Listbox',
    value: 'Listbox',
  },
  {
    label: 'Checkbox',
    value: 'Checkbox',
  },
  {
    label: 'Radio button',
    value: 'Radio button',
  },
  {
    label: 'Textarea',
    value: 'Textarea',
  },
  {
    label: 'Datetime',
    value: 'Datetime',
  },
];

export const StatusBoolean: OptionModel[] = [
  {
    label: 'Hoạt động',
    value: 1,
    color: '#14804A',
  },
  {
    label: 'Không hoạt động',
    value: 0,
    color: '#667085',
  },
];


export const ContractType: OptionModel[] = [
  {
    label: 'Hợp đồng lao động xác định thời hạn',
    value: 'HDXDTH',
  },
  {
    label: 'Hợp đồng lao động không xác định thời hạn',
    value: 'HDLDKXDTH',
  },
  {
    label: 'Viên chức quốc phòng',
    value: 'VCQP',
  },
  {
    label: 'Hợp đồng thử việc',
    value: 'Hợp đồng thử việc',
  },
];

export const RequestStatus = [
  {
    label: 'Đã duyệt',
    value: 'APPROVED',
    color: '#12B76A',
  },
  {
    label: 'Từ chối',
    value: 'REJECTED',
    color: '#EE0033',
  },
  {
    label: 'Chờ duyệt',
    value: 'PENDING',
    color: '#FFA500',
  },
  {
    label: 'Hoạt động',
    value: 'ACTIVE',
    color: '#12B76A',
  },
  {
    label: 'Ngừng hoạt động',
    value: 'INACTIVE',
    color: '#667085',
  },
];

export const ReasonDetail: OptionModel[] = [
  {
    label: 'Đi khách hàng',
    value: 'CLIENT_MEETING',
  },
  {
    label: 'Công tác',
    value: 'BUSINESS_TRIP',
  },
  {
    label: 'Việc cá nhân',
    value: 'PERSONAL',
  },
  {
    label: 'Đi họp',
    value: 'MEETING',
  },
  {
    label: 'Đi đào tạo/sự kiện',
    value: 'EVENT',
  },
  {
    label: 'Khác',
    value: 'OTHER',
  },
];

export const StatusGuestCard: OptionModel[] = [
  {
    label: 'Chờ cấp',
    value: 'PENDING',
    color: '#F59E0B',
  },
  {
    label: 'Đã cấp',
    value: 'ISSUED',
    color: '#1677FF',
  },
  {
    label: 'Đã trả',
    value: 'RETURNED',
    color: '#12B76A',
  },
];

export const CheckTypeOptions: OptionModel[] = [
  {
    label: 'CHECKIN',
    value: 'CHECKIN',
  },
  {
    label: 'CHECKOUT',
    value: 'CHECKOUT',
  },
];

export const ResignConfigStatus: OptionModel[] = [
  {
    label: 'Đang sử dụng',
    value: true,
    color: '#027A48',
  },
  {
    label: 'Ngừng sử dụng',
    value: false,
    color: '#667085',
  },
];

export const ResignDenyType: OptionModel[] = [
  {
    label: 'Từ chối',
    value: 'REJECT',
    color: '#A90024'
  },
  {
    label: 'Hủy',
    value: 'CANCEL',
    color: '#3B3F46',
  }
];

export const OffboardingStatus: OptionModel[] = [
  {
    label: 'Đang xử lý',
    value: 'IN_PROGRESS',
    color: '#F59E0B',
  },
  {
    label: 'Duyệt',
    value: 'ACCEPTED',
    color: '#12B76A',
  },
  {
    label: 'Từ chối',
    value: 'REJECTED',
    color: '#EE0033',
  }
]

export const ResignRequestStatus: OptionModel[] = [
  {
    value: 'DRAFT',
    label: 'Tạo mới',
  },
  {
    value: 'SUBMITTED',
    label: 'Chờ duyệt',
  },
  {
    value: 'REJECTED',
    label: 'Từ chối',
  },
  {
    value: 'WAITING_FOR_CANCEL',
    label: 'Chờ duyệt huỷ',
  },
  {
    value: 'CANCELLED',
    label: 'Huỷ luồng',
  },
  {
    value: 'OFFBOARDING',
    label: 'Đang bàn giao',
  },
  {
    value: 'SUBMIT_TTCD',
    label: 'Đã trình ký TTCD',
  },
  {
    value: 'PUBLISH_TTCD',
    label: 'Đã ban hành TTCD',
  }
];

export const RequiredStatus: OptionModel[] = [
  {
    label: 'Có',
    value: 1,
  },
  {
    label: 'Không',
    value: 0,
  }
]

export const QuestionTypeOptions: OptionModel[] = [
  {
    label: 'Multiple choice',
    value: 'MULTIPLE_CHOICE',
  },
  {
    label: 'Single choice',
    value: 'SINGLE_CHOICE',
  },
  {
    label: 'Text',
    value: 'TEXT',
  },
  {
    label: 'Rating',
    value: 'RATING',
  },
  {
    label: 'Single choice with text',
    value: 'SINGLE_CHOICE_WITH_TEXT',
  }
]

export const ConfirmDepartment: OptionModel[] = [
  {
    label: 'Quản lý trực tiếp',
    value: 1,
  },
  {
    label: 'Đơn vị xác nhận bàn giao',
    value: 2,
  }
]

export const GenderOptions: OptionModel[] = [
  {
    label: 'Nam',
    value: 'MALE',
  },
  {
    label: 'Nữ',
    value: 'FEMALE',
  }
];

export const PositionOptions: OptionModel[] = [
  { label: 'TV', value: 'TV' },
  { label: 'CV', value: 'CV' },
  { label: 'CVC', value: 'CVC' },
  { label: 'CVCC', value: 'CVCC' },
  { label: 'TP', value: 'TP' }
];
