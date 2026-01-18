import {
  ActionConfig,
  RequestStatus,
  StandardColumnModel,
  StandardColumnType,
  StandardFormItemModel
} from '../../shares/interfaces';
import { IconHtml } from '../../shares/enum/icon-html.enum';
import { scheduleTypes } from './special-schedule.constant';
export const specialScheduleColumns = (isManagerOrHR: boolean): StandardColumnModel[] => {
  const actions: ActionConfig[] = [];

  if (isManagerOrHR) {
    actions.push(
      {
        key: 'approve',
        icon: 'approve',
        label: 'Duyệt',
        html: IconHtml.ACCEPT,
        fieldCheckShow: 'isActiveAction',
      },
      {
        key: 'reject',
        icon: 'reject',
        label: 'Từ chối',
        html: IconHtml.REJECT,
        fieldCheckShow: 'isActiveAction',
      }
    );
  } else {
    actions.push(
      {
        key: 'edit',
        icon: 'edit',
        label: 'Sửa',
        html: IconHtml.UPDATE,
        fieldCheckShow: 'isActiveAction',
      },
      {
        key: 'delete',
        icon: 'delete',
        label: 'Xóa',
        html: IconHtml.DELETE,
        fieldCheckShow: 'isActiveAction',
      }
    );
  }

  return [
    {
      id: 0,
      name: 'index',
      fixedColumn: true,
      fixedRight: false,
      attr: 'STT',
      type: StandardColumnType.TEXT,
      width: '50px',
      isRequire: false,
      isFilter: false,
      isSort: false,
      indexColumn: true,
    },
    {
      id: 1,
      name: 'action',
      fixedColumn: true,
      fixedRight: false,
      attr: 'Thao tác',
      type: StandardColumnType.ACTION,
      width: '100px',
      isFilter: false,
      isSort: false,
      listAction: actions,
    },
    {
      id: 2,
      name: 'employeeCode',
      fixedColumn: true,
      fixedRight: false,
      attr: 'Mã NV',
      type: StandardColumnType.TEXT,
      width: '100px',
      isFilter: true,
      filter: { type: StandardColumnType.INPUT },
    },
    {
      id: 3,
      name: 'employeeName',
      fixedColumn: true,
      fixedRight: false,
      attr: 'Tên NV',
      type: StandardColumnType.TEXT,
      width: '150px',
      isFilter: true,
      filter: { type: StandardColumnType.INPUT },
    },
    {
      id: 4,
      name: 'departmentName',
      fixedColumn: true,
      fixedRight: false,
      attr: 'Phòng ban',
      type: StandardColumnType.TEXT,
      width: '120px',
      isFilter: true,
      filter: { type: StandardColumnType.INPUT },
    },
    {
      id: 5,
      name: 'startDate',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Ngày bắt đầu',
      type: StandardColumnType.DATE_PICKER,
      width: '120px',
      isFilter: true,
      filter: { type: StandardColumnType.DATE_PICKER },
    },
    {
      id: 6,
      name: 'endDate',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Ngày kết thúc',
      type: StandardColumnType.DATE_PICKER,
      width: '120px',
      isFilter: true,
      filter: { type: StandardColumnType.DATE_PICKER },
    },
    {
      id: 7,
      name: 'morningStart',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Giờ đăng ký (từ)',
      type: StandardColumnType.TEXT,
      width: '100px',
      isFilter: true,
      filter: { type: StandardColumnType.TIME_PICKER },
    },
    {
      id: 10,
      name: 'afternoonEnd',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Giờ đăng ký (đến)',
      type: StandardColumnType.TEXT,
      width: '100px',
      isFilter: true,
      filter: { type: StandardColumnType.TIME_PICKER },
    },
    {
      id: 11,
      name: 'type',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Loại',
      type: StandardColumnType.SELECT,
      width: '100px',
      isFilter: true,
      filter: {
        type: StandardColumnType.SELECT,
        options: scheduleTypes,
      },
    },
    {
      id: 12,
      name: 'reason',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Lý do',
      type: StandardColumnType.TEXT,
      width: '180px',
      isFilter: true,
      filter: { type: StandardColumnType.INPUT },
    },
    {
      id: 13,
      name: 'status',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Trạng thái',
      type: StandardColumnType.SELECT,
      width: '110px',
      isFilter: true,
      filter: {
        type: StandardColumnType.SELECT,
        options: [
          { value: 'PENDING', label: 'Chờ duyệt' },
          { value: 'APPROVED', label: 'Đã duyệt' },
          { value: 'REJECTED', label: 'Từ chối' },
        ],
      },
    },
  ];

}

export const specialScheduleColumnFilter: StandardFormItemModel[] = [
  {
    field: 'employeeId',
    label: 'Mã nhân viên',
    type: StandardColumnType.INPUT_NUMBER,
  },
  {
    field: 'employeeName',
    label: 'Tên nhân viên',
    type: StandardColumnType.TEXT,
  },
  {
    field: 'employeeEmail',
    label: 'Email',
    type: StandardColumnType.TEXT,
  },
  {
    field: 'departmentName',
    label: 'Phòng ban',
    type: StandardColumnType.SELECT,
    multiple: false,
    options: [],
  },
  {
    field: 'absenceTypeCode',
    label: 'Loại',
    type: StandardColumnType.SELECT,
    options: [],
    multiple: false,
  },
  {
    field: 'absenceReason',
    label: 'Lý do',
    type: StandardColumnType.TEXT,
  },
];
