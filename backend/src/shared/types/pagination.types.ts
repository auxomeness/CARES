export type PaginationQuery = {
  page: number;
  limit: number;
  search?: string;
};

export type PaginatedResult<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
};
