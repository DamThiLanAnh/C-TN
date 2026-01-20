import { StandardColumnModel, StandardColumnType, ActionConfig } from '../../shares/interfaces';
import { IconHtml } from '../../shares/enum/icon-html.enum';

export const certificatesManageColumns = (): StandardColumnModel[] => [
  {
    id: 0,
    name: 'index',
    fixedColumn: true,
    fixedRight: false,
    attr: 'STT',
    type: StandardColumnType.TEXT,
    width: '50px',
    isRequire: false,
    isSort: false,
    indexColumn: true,
    classes: 'text-center'
  },
  {
    id: 1,
    name: 'action',
    fixedColumn: true,
    fixedRight: false,
    attr: 'Thao tác',
    type: StandardColumnType.ACTION,
    width: '80px',
    isFilter: false,
    isSort: false,
    classes: 'text-center',
    listAction: [
      {
        key: 'edit',
        icon: 'edit',
        label: 'Sửa',
        html: IconHtml.UPDATE,
        fieldCheckShow: 'isActiveAction',
      } as ActionConfig,
      {
        key: 'delete',
        icon: 'delete',
        label: 'Xóa',
        html: IconHtml.DELETE,
        fieldCheckShow: 'isActiveAction',
      } as ActionConfig,
    ],
  },
  {
    id: 2,
    name: 'employeeCode',
    fixedColumn: false,
    fixedRight: false,
    attr: 'Mã nhân viên',
    type: StandardColumnType.TEXT,
    width: '120px',
    isRequire: true,
    isFilter: true,
    filter: {
      type: StandardColumnType.INPUT,
    },
    isSort: true,
  },
  {
    id: 3,
    name: 'employeeName',
    fixedColumn: false,
    fixedRight: false,
    attr: 'Tên nhân viên',
    type: StandardColumnType.TEXT,
    width: '180px',
    isRequire: true,
    isFilter: true,
    filter: {
      type: StandardColumnType.INPUT,
    },
    isSort: true,
  },
  {
    id: 4,
    name: 'name',
    fixedColumn: false,
    fixedRight: false,
    attr: 'Tên chứng chỉ',
    type: StandardColumnType.TEXT,
    width: '180px',
    isRequire: true,
    isFilter: true,
    filter: {
      type: StandardColumnType.INPUT,
    },
    isSort: true,
  },
  {
    id: 5,
    name: 'issuer',
    fixedColumn: false,
    fixedRight: false,
    attr: 'Nơi cấp',
    type: StandardColumnType.TEXT,
    width: '150px',
    isRequire: true,
    isFilter: true,
    filter: {
      type: StandardColumnType.INPUT,
    },
    isSort: true,
  },
  {
    id: 6,
    name: 'issuedDate',
    fixedColumn: false,
    fixedRight: false,
    attr: 'Ngày cấp',
    type: StandardColumnType.TEXT, // Or DATE_PICKER if we want date filter later, using string for display now
    width: '120px',
    isRequire: true,
    isFilter: true, // Can filter by string date
    filter: {
      type: StandardColumnType.DATE_PICKER,
    },
    isSort: true,
  },
  {
    id: 7,
    name: 'expiredDate',
    fixedColumn: false,
    fixedRight: false,
    attr: 'Ngày hết hạn',
    type: StandardColumnType.TEXT,
    width: '120px',
    isRequire: true,
    isFilter: true,
    filter: {
      type: StandardColumnType.DATE_PICKER,
    },
    isSort: true,
  },
  {
    id: 8,
    name: 'status',
    fixedColumn: false,
    fixedRight: false,
    attr: 'Trạng thái',
    type: StandardColumnType.TEXT,
    width: '150px',
    isRequire: true,
    isFilter: true,
    filter: {
      type: StandardColumnType.SELECT,
      options: [
        { value: 'ACTIVE', label: 'Hoạt động' },
        { value: 'INACTIVE', label: 'Ngừng hoạt động' }
      ]
    },
    isSort: true,
    classes: 'text-center'
  }
];
