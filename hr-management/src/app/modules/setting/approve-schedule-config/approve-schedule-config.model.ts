export interface PersonalApprovalConfig {
    employeeId: number;
    employeeCode: string;
    employeeName: string;
    approverId: number;
    approverCode: string;
    approverName: string;
    createdAt: string;
}

export interface PersonalApprovalConfigResponse {
    content: PersonalApprovalConfig[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalElements: number;
    totalPages: number;
    first: boolean;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    numberOfElements: number;
    empty: boolean;
}

export interface DepartmentApprovalConfig {
    departmentId: number;
    departmentCode: string;
    departmentName: string;
    approverId: number | null;
    approverCode: string | null;
    approverName: string | null;
    createdAt: string;
}

export interface DepartmentApprovalConfigResponse {
    content: DepartmentApprovalConfig[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalElements: number;
    totalPages: number;
    first: boolean;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    numberOfElements: number;
    empty: boolean;
}
