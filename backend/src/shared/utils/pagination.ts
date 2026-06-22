import { PaginationQuery } from "../types/pagination.types";

export function getPagination(query: PaginationQuery): { skip: number; take: number } {
  return {
    skip: (query.page - 1) * query.limit,
    take: query.limit
  };
}
