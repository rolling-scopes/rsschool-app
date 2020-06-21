export type IPaginationInfo = {
  total: number;
  totalPages: number;
  current: number;
  pageSize: number;
};

export type Pagination<T> = {
  content: T[];
  pagination: IPaginationInfo;
};
