import {
  StandardColumnType,
  StandardColumnModel,
  StandardFormItemModel,
  ActionConfig,
  RequestStatus,
} from '../../shares/interfaces';
import { IconHtml } from '../../shares/enum/icon-html.enum';

export const leaveManageColumns = (isManagerOrHR: boolean): StandardColumnModel[] => {
  const actions: ActionConfig[] = [];

  if (isManagerOrHR) {
    actions.push(
      {
        key: 'approve',
        icon: 'approve',
        label: 'Duyệt',
        html: IconHtml.ACCEPT,
        rules: [],
        fieldCheckShow: 'isActiveAction',
      },
      {
        key: 'reject',
        icon: 'reject',
        label: 'Từ chối',
        html: IconHtml.REJECT,
        rules: [],
        fieldCheckShow: 'isActiveAction',
      }
    );
  } else {
    actions.push(
      {
        key: 'edit',
        icon: 'edit',
        label: 'Cập nhật',
        html: IconHtml.UPDATE,
        rules: [],
        // fieldCheckShow: 'isActiveAction', // Optional: Show only if pending?
      },
      {
        key: 'delete',
        icon: 'delete',
        label: 'Xóa',
        html: IconHtml.DELETE, // Check if DELETE icon is available
        rules: [],
        // fieldCheckShow: 'isActiveAction',
      }
    );
  }

  return [
    {
      id: 1,
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
      listAction: actions,
    },
    {
      id: 3,
      name: 'employeeUserName',
      fixedColumn: true,
      fixedRight: false,
      attr: 'Mã nhân viên',
      type: StandardColumnType.TEXT,
      width: '130px',
      isFilter: true,
      isSort: false,
      filter: { type: StandardColumnType.INPUT },
      classes: 'text-right',
    },
    {
      id: 4,
      name: 'employeeName',
      fixedColumn: true,
      fixedRight: false,
      attr: 'Tên nhân viên',
      type: StandardColumnType.TEXT,
      width: '150px',
      isFilter: true,
      isSort: false,
      filter: { type: StandardColumnType.INPUT },
    },
    {
      id: 6,
      name: 'employeeEmail',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Email',
      type: StandardColumnType.TEXT,
      width: '170px',
      isFilter: true,
      isSort: false,
      filter: { type: StandardColumnType.INPUT },
    },
    {
      id: 7,
      name: 'departmentName',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Phòng ban',
      width: '150px',
      isFilter: true,
      isSort: false,
      filter: {
        name: 'departmentName',
        type: StandardColumnType.SELECT,
        options: [],
        multiple: true,
      },
      type: StandardColumnType.SELECT,
    },
    {
      id: 8,
      name: 'absenceTypeName',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Loại',
      type: StandardColumnType.SELECT,
      width: '130px',
      isRequire: false,
      isFilter: true,
      filter: {
        type: StandardColumnType.SELECT,
        name: 'absenceTypeName',
        options: [
          { value: 'Nghỉ phép năm', label: 'Phép năm' },
          { value: 'Nghỉ không lương', label: 'Không lương' },
          { value: 'Khác', label: 'Khác' }
        ],
        multiple: true,
      },
    },
    {
      id: 9,
      name: 'leaveDate',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Ngày nghỉ',
      type: StandardColumnType.DATE_PICKER,
      width: '140px',
      isSort: false,
      isFilter: true,
      filter: { type: StandardColumnType.DATE_PICKER },
    },
    {
      id: 10,
      name: 'duration',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Thời lượng',
      type: StandardColumnType.SELECT,
      width: '150px',
      isFilter: true,
      isSort: false,
      classes: 'text-center',
      filter: {
        type: StandardColumnType.SELECT,
        name: 'duration',
        options: [
          { value: 'FULL_DAY', label: 'Cả ngày' },
          { value: 'MORNING', label: 'Sáng' },
          { value: 'AFTERNOON', label: 'Chiều' }
        ],
        multiple: true,
      },
    },
    {
      id: 12,
      name: 'absenceReason',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Lý do',
      type: StandardColumnType.TEXT,
      width: '160px',
      isRequire: true,
      isFilter: true,
    },
    {
      id: 5,
      name: 'absenceStatus',
      fixedColumn: true,
      fixedRight: true,
      attr: 'Trạng thái',
      type: StandardColumnType.TAG,
      isFilter: true,
      width: '130px',
      filter: {
        name: 'absenceStatus',
        type: StandardColumnType.SELECT,
        options: RequestStatus, // Sử dụng RequestStatus đã định nghĩa lại
        multiple: true,
      },
      isSort: true,
      classes: 'tag-left',
    },

  ];
};


export const leaveColumnFilter: StandardFormItemModel[] = [
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
