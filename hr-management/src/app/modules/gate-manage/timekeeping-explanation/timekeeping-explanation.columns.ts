import { StandardColumnModel } from '../../shares/interfaces';

export function timekeepingExplanationColumns(): StandardColumnModel[] {
  return [
    {
      id: 1,
      attr: 'STT',
      name: 'index',
      width: '60px',
      type: 0,
      isSort: false,
      classes: 'text-center'
    },
    {
      id: 2,
      attr: 'Thao tác',
      name: 'action',
      width: '100px',
      type: 0,
      isSort: false,
      classes: 'text-center',
      listAction: [
        {
          key: 'approve',
          label: 'Duyệt',
          html: '<span nz-icon nzType="check-circle" nzTheme="outline" style="color: #52c41a; font-size: 18px;"></span>'
        },
        {
          key: 'reject',
          label: 'Từ chối',
          html: '<span nz-icon nzType="close-circle" nzTheme="outline" style="color: #ff4d4f; font-size: 18px;"></span>'
        }
      ]
    },
    {
      id: 3,
      attr: 'Mã nhân viên',
      name: 'employeeUserName',
      width: '130px',
      type: 0,
      isSort: true
    },
    {
      id: 4,
      attr: 'Tên nhân viên',
      name: 'employeeName',
      width: '180px',
      type: 0,
      isSort: true
    },
    {
      id: 5,
      attr: 'Email',
      name: 'employeeEmail',
      width: '200px',
      type: 0,
      isSort: false
    },
    {
      id: 6,
      attr: 'Phòng ban',
      name: 'departmentName',
      width: '150px',
      type: 0,
      isSort: true
    },
    {
      id: 7,
      attr: 'Ngày giải trình',
      name: 'workDate',
      width: '150px',
      type: 0,
      isSort: true
    },
    {
      id: 8,
      attr: 'Giờ vào chấm công',
      name: 'checkInTime',
      width: '100px',
      type: 0,
      isSort: false
    },
    {
      id: 8,
      attr: 'Giờ vào giải trình',
      name: 'proposedCheckIn',
      width: '100px',
      type: 0,
      isSort: false
    },
    {
      id: 9,
      attr: 'Giờ ra chấm công',
      name: 'checkOutTime',
      width: '100px',
      type: 0,
      isSort: false
    },
    {
      id: 9,
      attr: 'Giờ ra giải trình',
      name: 'proposedCheckOut',
      width: '100px',
      type: 0,
      isSort: false
    },
    {
      id: 10,
      attr: 'Lý do',
      name: 'reason',
      width: '250px',
      type: 0,
      isSort: false
    },
    {
      id: 11,
      attr: 'Trạng thái',
      name: 'status',
      width: '120px',
      type: 7, // Tag type
      isSort: false,
      fixedRight: true
    }
  ];
}

