import { UserRole } from "@prisma/client";

import { AuthenticatedUser } from "../../shared/types/auth.types";
import { appointmentService } from "../appointments/service/appointment.service";
import { concernService } from "../concerns/service/concern.service";
import { directoryService } from "../directory/service/directory.service";
import { notificationService } from "../notifications/service/notification.service";
import { userService } from "../users/service/user.service";

const BOOTSTRAP_PAGE = { page: 1, limit: 20 };
const STUDENT_DASHBOARD_PAGE = { page: 1, limit: 100 };
const DIRECTORY_PAGE = { page: 1, limit: 100 };

export const bootstrapService = {
  async getBootstrap(actor: AuthenticatedUser) {
    const [user, notifications, offices, departments, faculty] = await Promise.all([
      userService.getCurrentUserProfile(actor),
      notificationService.getUserNotifications(actor, BOOTSTRAP_PAGE),
      directoryService.getOfficeDirectory(DIRECTORY_PAGE),
      directoryService.getDepartmentDirectory(DIRECTORY_PAGE),
      directoryService.getFacultyDirectory(DIRECTORY_PAGE)
    ]);

    const rolePayload = await getRolePayload(actor);

    return {
      user,
      notifications,
      directory: {
        offices,
        departments,
        faculty
      },
      ...rolePayload
    };
  }
};

async function getRolePayload(actor: AuthenticatedUser) {
  if (actor.role === UserRole.STUDENT) {
    const [concerns, appointments, publicConcerns] = await Promise.all([
      concernService.getConcerns(actor, STUDENT_DASHBOARD_PAGE),
      appointmentService.getAppointments(actor, STUDENT_DASHBOARD_PAGE),
      concernService.getPublicConcerns({ ...BOOTSTRAP_PAGE, limit: 50 })
    ]);

    return {
      concerns,
      appointments,
      publicConcerns
    };
  }

  if (
    actor.role === UserRole.ADMIN ||
    actor.role === UserRole.OFFICE_STAFF ||
    actor.role === UserRole.DEAN ||
    actor.role === UserRole.CHAIR ||
    actor.role === UserRole.PROFESSOR
  ) {
    const [concerns, appointments] = await Promise.all([
      concernService.getConcerns(actor, BOOTSTRAP_PAGE),
      appointmentService.getAppointments(actor, BOOTSTRAP_PAGE)
    ]);

    return {
      concerns,
      appointments
    };
  }

  return {};
}
