import { AppointmentStatus, AppointmentTargetType, UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  repository: {
    findStudentByUserId: vi.fn(),
    findOfficeById: vi.fn(),
    create: vi.fn(),
    findAccessRecord: vi.fn(),
    findOfficeStaffByUserId: vi.fn(),
    updateStatus: vi.fn()
  },
  checkAvailability: vi.fn()
}));

vi.mock("../../src/modules/appointments/repository/appointment.repository", () => ({
  appointmentRepository: mocks.repository
}));
vi.mock("../../src/modules/appointments/availability/availability.service", () => ({
  availabilityService: { checkAvailability: mocks.checkAvailability }
}));
vi.mock("../../src/modules/notifications/service/notification.events", () => ({
  publishNotificationEvent: vi.fn()
}));
vi.mock("../../src/shared/utils/logger", () => ({
  logger: { info: vi.fn() }
}));

import { appointmentService } from "../../src/modules/appointments/service/appointment.service";

describe("appointmentService", () => {
  beforeEach(() => {
    Object.values(mocks.repository).forEach((mock) => mock.mockReset());
    mocks.checkAvailability.mockReset();
  });

  it("creates a pending appointment only after availability validation", async () => {
    mocks.repository.findStudentByUserId.mockResolvedValue({ id: "student-profile" });
    mocks.repository.findOfficeById.mockResolvedValue({ id: "office-id" });
    mocks.repository.create.mockResolvedValue({
      id: "appointment-id",
      title: "Consultation",
      status: AppointmentStatus.PENDING,
      targetType: AppointmentTargetType.OFFICE,
      officeId: "office-id",
      departmentId: null,
      facultyId: null,
      startTime: new Date("2030-01-01T01:00:00.000Z"),
      endTime: new Date("2030-01-01T01:30:00.000Z"),
      student: { user: { id: "student-user" } }
    });

    const appointment = await appointmentService.createAppointment(
      {
        title: "Consultation",
        targetType: AppointmentTargetType.OFFICE,
        officeId: "office-id",
        departmentId: null,
        facultyId: null,
        startTime: "2030-01-01T01:00:00.000Z",
        endTime: "2030-01-01T01:30:00.000Z"
      },
      { id: "student-user", role: UserRole.STUDENT }
    );

    expect(mocks.checkAvailability).toHaveBeenCalledOnce();
    expect(appointment.status).toBe(AppointmentStatus.PENDING);
  });

  it("prevents handlers from approving appointments outside their target", async () => {
    mocks.repository.findAccessRecord.mockResolvedValue({
      id: "appointment-id",
      status: AppointmentStatus.PENDING,
      targetType: AppointmentTargetType.OFFICE,
      officeId: "office-a"
    });
    mocks.repository.findOfficeStaffByUserId.mockResolvedValue({ officeId: "office-b" });

    await expect(
      appointmentService.approveAppointment("appointment-id", {
        id: "staff-user",
        role: UserRole.OFFICE_STAFF
      })
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});
