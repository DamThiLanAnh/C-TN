import {
  ActionConfig,
  RequestStatus,
  StandardColumnModel,
  StandardColumnType,
  StandardFormItemModel
} from '../../shares/interfaces';
import { IconHtml } from '../../shares/enum/icon-html.enum';


export const employeeManageColumns = (): StandardColumnModel[] => {
  return [
    {
      id: 1,
      name: 'index',
      fixedColumn: true,
      fixedRight: false,
      attr: 'STT',
      type: StandardColumnType.TEXT,
      width: '60px',
      isFilter: false,
      isSort: false,
      classes: 'text-center',
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
          key: 'edit',
          icon: 'edit',
          label: 'Chỉnh sửa',
          html: IconHtml.UPDATE,
          rules: [],
          fieldCheckShow: 'isActiveAction',
        } as ActionConfig,
        {
          key: 'delete',
          icon: 'delete',
          label: 'Xóa',
          html: IconHtml.DELETE,
          rules: [],
          fieldCheckShow: 'isActiveAction',
        } as ActionConfig,
      ],
    },
    {
      id: 3,
      name: 'code',
      fixedColumn: true,
      fixedRight: false,
      attr: 'Mã nhân viên',
      type: StandardColumnType.TEXT,
      width: '120px',
      isFilter: true,
      isSort: true,
      filter: { type: StandardColumnType.INPUT },
      classes: 'text-right',
    },
    {
      id: 4,
      name: 'fullName',
      fixedColumn: true,
      fixedRight: false,
      attr: 'Tên nhân viên',
      type: StandardColumnType.TEXT,
      width: '180px',
      isFilter: true,
      isSort: true,
      filter: { type: StandardColumnType.INPUT },
    },
    {
      id: 6,
      name: 'email',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Email',
      type: StandardColumnType.TEXT,
      width: '200px',
      isFilter: true,
      isSort: true,
      filter: { type: StandardColumnType.INPUT },
    },
    {
      id: 7,
      name: 'departmentName',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Phòng ban',
      width: '160px',
      isFilter: true,
      isSort: true,
      filter: {
        name: 'departmentName',
        multiple: true,
        options: []
      },
      type: StandardColumnType.SELECT,
    },
    {
      id: 10,
      name: 'position',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Vị trí',
      width: '120px',
      isFilter: true,
      isSort: true,
      filter: {
        name: 'position',
        multiple: true,
        options: []
      },
      type: StandardColumnType.SELECT,
    },
    {
      id: 12,
      name: 'statusName',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Tình trạng',
      width: '100px',
      isFilter: true,
      isSort: true,
      filter: {
        name: 'statusName',
        multiple: true,
        options: []
      },
      type: StandardColumnType.TAG,
    },
    {
      id: 13,
      name: 'gender',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Giới tính',
      width: '100px',
      isFilter: true,
      isSort: true,
      filter: {
        name: 'gender',
        multiple: true,
        options: []
      },
      type: StandardColumnType.SELECT,
    },
    {
      id: 14,
      name: 'dateOfBirth',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Ngày sinh',
      width: '120px',
      isFilter: true,
      isSort: true,
      filter: {
        name: 'dateOfBirth',
        type: StandardColumnType.DATE_RANGE_PICKER
      },
      type: StandardColumnType.DATE_RANGE_PICKER,
    },
    {
      id: 13,
      name: 'phoneNumber',
      fixedColumn: false,
      fixedRight: false,
      attr: 'SĐT',
      width: '120px',
      isFilter: true,
      isSort: true,
      filter: {
        type: StandardColumnType.INPUT
      },
      type: StandardColumnType.TEXT,
    },
    {
      id: 17,
      name: 'createdAt',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Ngày vào làm',
      type: StandardColumnType.DATE_RANGE_PICKER,
      width: '140px',
      isSort: true,
      isFilter: true,
      filter: {
        name: 'createdAt',
        type: StandardColumnType.DATE_RANGE_PICKER
      }
    },
  ];
};
export const employeeColumnFilter: StandardFormItemModel[] = [

]
