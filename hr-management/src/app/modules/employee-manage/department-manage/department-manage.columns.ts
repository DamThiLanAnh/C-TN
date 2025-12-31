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
          html: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<mask id="mask0_delete_red" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="16">
<path d="M16 0H0V16H16V0Z" fill="white"/></mask><g mask="url(#mask0_delete_red)"><path d="M10.6667 4.00016V3.46683C10.6667 2.72009 10.6667 2.34672 10.5213 2.06151C10.3935 1.81063 10.1895 1.60665 9.93865 1.47882C9.65344 1.3335 9.28007 1.3335 8.53333 1.3335H7.46667C6.71993 1.3335 6.34656 1.3335 6.06135 1.47882C5.81046 1.60665 5.60649 1.81063 5.47866 2.06151C5.33333 2.34672 5.33333 2.72009 5.33333 3.46683V4.00016M6.66667 7.66683V11.0002M9.33333 7.66683V11.0002M2 4.00016H14M12.6667 4.00016V11.4668C12.6667 12.5869 12.6667 13.147 12.4487 13.5748C12.2569 13.9511 11.951 14.2571 11.5746 14.4488C11.1468 14.6668 10.5868 14.6668 9.46667 14.6668H6.53333C5.41323 14.6668 4.85318 14.6668 4.42535 14.4488C4.04903 14.2571 3.74307 13.9511 3.55132 13.5748C3.33333 13.147 3.33333 12.5869 3.33333 11.4668V4.00016" stroke="#ff4d4f" stroke-linecap="round" stroke-linejoin="round"/>
</g></svg>`,
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
