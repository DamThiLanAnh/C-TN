import { ActionConfig, StandardColumnModel, StandardColumnType } from '../../shares/interfaces';
import { IconHtml } from '../../shares/enum/icon-html.enum';

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
      name: 'action',
      fixedColumn: true,
      fixedRight: false,
      attr: 'Thao tác',
      type: StandardColumnType.ACTION,
      width: '100px',
      isFilter: false,
      isSort: false,
      rulesAction: {
        isEdit: [''],
        isRemove: [''],
      },
      listAction: [
        {
          key: 'approve',
          icon: 'approve',
          label: 'Duyệt',
          html: IconHtml.ACCEPT,
          rules: [],
          fieldCheckShow: 'isActiveAction',
        } as ActionConfig,
        {
          key: 'reject',
          icon: 'reject',
          label: 'Từ chối',
          html: IconHtml.REJECT,
          rules: [],
          fieldCheckShow: 'isActiveAction',
        } as ActionConfig,
      ],
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

