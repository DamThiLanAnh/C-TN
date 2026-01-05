import {
  StandardColumnType,
  StandardColumnModel
} from '../../shares/interfaces';

export const activityLogColumns = (): StandardColumnModel[] => {
  return [
    {
      id: 1,
      name: 'userId',
      fixedColumn: false,
      fixedRight: false,
      attr: 'NV tạo',
      type: StandardColumnType.TEXT,
      width: '50px',
      isRequire: false,
      isFilter: false,
      isSort: false,
      classes: 'text-center'
    },
    {
      id: 2,
      name: 'action',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Hành động',
      type: StandardColumnType.TEXT,
      width: '150px',
      isFilter: true, // Example: enable filtering
      isSort: false,
      filter: { type: StandardColumnType.INPUT }
    },
    {
      id: 3,
      name: 'details',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Chi tiết',
      type: StandardColumnType.TEXT,
      width: '250px',
      isFilter: true,
      isSort: false,
      filter: { type: StandardColumnType.INPUT }
    },
    {
      id: 4,
      name: 'date',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Ngày',
      type: StandardColumnType.DATE_PICKER,
      width: '150px',
      isFilter: true,
      isSort: true,
      filter: { type: StandardColumnType.DATE_PICKER }
    },
    {
      id: 5,
      name: 'time',
      fixedColumn: false,
      fixedRight: false,
      attr: 'Thời gian',
      type: StandardColumnType.TIME_RANGE_PICKER,
      width: '150px',
      isFilter: true,
      isSort: false,
      filter: { type: StandardColumnType.TIME_RANGE_PICKER }
    }
  ];
};
