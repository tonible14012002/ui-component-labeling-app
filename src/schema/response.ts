
export type ResponseWithData<T> = {
    status: number;
    data: T;
}

export type ResponseWithDataPagination<T> = {
    status: number;
    data: T[];
    totalCount: number;
    page: number;
    pageSize: number;
}