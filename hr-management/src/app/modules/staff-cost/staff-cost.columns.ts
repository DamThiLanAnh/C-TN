import { StandardColumnModel, StandardColumnType } from '../shares/interfaces';

export const staffCostColumns = (): StandardColumnModel[] => {
    return [
        {
            id: 1,
            name: 'index',
            fixedColumn: true,
            fixedRight: false,
            attr: 'STT',
            type: StandardColumnType.TEXT,
            width: '30px',
            isRequire: false,
            isFilter: false,
            isSort: false,
            indexColumn: true,
            classes: 'text-center',
        },
        {
            id: 2,
            name: 'title',
            fixedColumn: false,
            fixedRight: false,
            attr: 'Tiêu đề',
            type: StandardColumnType.TEXT,
            width: '200px',
            isRequire: true,
            isFilter: true,
            filter: {
                type: StandardColumnType.INPUT,
            },
        },
        {
            id: 5,
            name: 'importedAt',
            fixedColumn: false,
            fixedRight: false,
            attr: 'Ngày nhập',
            type: StandardColumnType.TEXT,
            width: '150px',
            isRequire: true,
            isFilter: false,
            isSort: true,
            classes: 'text-center',
        }
    ];
};
