import { directoryRepository } from "../repository/directory.repository";

export const directoryService = {
  async getFacultyDirectory(search?: string) {
    const faculty = await directoryRepository.findFaculty(search);

    return faculty.map((member) => ({
      id: member.id,
      name: [member.user.firstName, member.user.middleName, member.user.lastName]
        .filter(Boolean)
        .join(" "),
      position: member.position,
      department: member.department.name,
      departmentId: member.department.id
    }));
  },

  async getOfficeDirectory(search?: string) {
    return directoryRepository.findOffices(search);
  },

  async getDepartmentDirectory(search?: string) {
    return directoryRepository.findDepartments(search);
  }
};
