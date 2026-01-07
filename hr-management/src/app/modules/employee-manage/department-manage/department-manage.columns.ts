import {
  ActionConfig,
  StandardColumnModel,
  StandardColumnType,
  StandardFormItemModel
} from '../../shares/interfaces';
import { IconHtml } from '../../shares/enum/icon-html.enum';

export const departmentManageColumns = (): StandardColumnModel[] => {
  return [
    {
      id: 0,
      name: 'index',
      fixedColumn: true,
      fixedRight: false,
      attr: 'STT',
      type: StandardColumnType.TEXT,
      width: '30px',
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
      width: '50px',
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
      name: 'code',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Mã phòng ban',
      type: StandardColumnType.TEXT,
      width: '150px',
      isFilter: true,
      filter: { type: StandardColumnType.INPUT },
    },
    {
      id: 3,
      name: 'name',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Tên phòng ban',
      type: StandardColumnType.TEXT,
      width: '250px',
      isFilter: true,
      filter: { type: StandardColumnType.INPUT },
    },
    {
      id: 4,
      name: 'status',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Trạng thái',
      type: StandardColumnType.SELECT,
      width: '150px',
      isFilter: true,
      filter: {
        type: StandardColumnType.SELECT,
        options: [
          { value: 'ACTIVE', label: 'Hoạt động' },
          { value: 'INACTIVE', label: 'Ngừng hoạt động' },
        ],
      },
    },
  ];
};

export const departmentManageColumnFilter: StandardFormItemModel[] = [
  {
    field: 'code',
    label: 'Mã phòng ban',
    type: StandardColumnType.INPUT,
  },
  {
    field: 'name',
    label: 'Tên phòng ban',
    type: StandardColumnType.TEXT,
  },
  {
    field: 'status',
    label: 'Trạng thái',
    type: StandardColumnType.SELECT,
    options: [],
    multiple: false,
  },
];
