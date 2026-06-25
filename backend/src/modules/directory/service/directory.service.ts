import { env } from "../../../config/env";
import { PaginationQuery } from "../../../shared/types/pagination.types";
import { cacheGetOrSet } from "../../../shared/utils/cache";
import { getPagination } from "../../../shared/utils/pagination";
import { directoryRepository } from "../repository/directory.repository";

export const directoryService = {
  async getFacultyDirectory(query: PaginationQuery) {
    return cacheGetOrSet(
      buildDirectoryCacheKey("faculty", query),
      env.DIRECTORY_CACHE_TTL_SECONDS,
      async () => {
        const { skip, take } = getPagination(query);
        const [faculty, total] = await Promise.all([
          directoryRepository.findFaculty({ search: query.search, skip, take }),
          directoryRepository.countFaculty(query.search)
        ]);

        return {
          data: faculty.map((member) => ({
            id: member.id,
            name: [member.user.firstName, member.user.middleName, member.user.lastName]
              .filter(Boolean)
              .join(" "),
            position: member.position,
            department: member.department.name,
            departmentId: member.department.id
          })),
          meta: { page: query.page, limit: query.limit, total }
        };
      }
    );
  },

  async getOfficeDirectory(query: PaginationQuery) {
    return cacheGetOrSet(
      buildDirectoryCacheKey("offices", query),
      env.DIRECTORY_CACHE_TTL_SECONDS,
      async () => {
        const { skip, take } = getPagination(query);
        const [data, total] = await Promise.all([
          directoryRepository.findOffices({ search: query.search, skip, take }),
          directoryRepository.countOffices(query.search)
        ]);
        return { data, meta: { page: query.page, limit: query.limit, total } };
      }
    );
  },

  async getDepartmentDirectory(query: PaginationQuery) {
    return cacheGetOrSet(
      buildDirectoryCacheKey("departments", query),
      env.DIRECTORY_CACHE_TTL_SECONDS,
      async () => {
        const { skip, take } = getPagination(query);
        const [data, total] = await Promise.all([
          directoryRepository.findDepartments({ search: query.search, skip, take }),
          directoryRepository.countDepartments(query.search)
        ]);
        return { data, meta: { page: query.page, limit: query.limit, total } };
      }
    );
  }
};

function buildDirectoryCacheKey(type: string, query: PaginationQuery): string {
  return ["directory", type, query.page, query.limit, query.search?.toLowerCase() ?? ""].join(":");
}
