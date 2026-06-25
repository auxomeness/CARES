import { ConcernStatus, ConcernTargetType, ConcernVisibility, UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  repository: {
    findStudentByUserId: vi.fn(),
    findOfficeById: vi.fn(),
    createConcern: vi.fn(),
    findAccessRecord: vi.fn(),
    findOfficeStaffByUserId: vi.fn(),
    updateStatus: vi.fn()
  }
}));

vi.mock("../../src/modules/concerns/repository/concern.repository", () => ({
  concernRepository: mocks.repository
}));
vi.mock("../../src/modules/notifications/service/notification.events", () => ({
  publishNotificationEvent: vi.fn()
}));
vi.mock("../../src/shared/utils/logger", () => ({
  logger: { info: vi.fn() }
}));

import { concernService } from "../../src/modules/concerns/service/concern.service";

describe("concernService", () => {
  beforeEach(() => {
    Object.values(mocks.repository).forEach((mock) => mock.mockReset());
  });

  it("creates a manually targeted concern", async () => {
    mocks.repository.findStudentByUserId.mockResolvedValue({ id: "student-profile" });
    mocks.repository.findOfficeById.mockResolvedValue({ id: "office-id" });
    mocks.repository.createConcern.mockResolvedValue({
      id: "concern-id",
      title: "Portal issue",
      referenceNumber: "CARES-TEST",
      targetType: ConcernTargetType.OFFICE,
      targetOfficeId: "office-id",
      targetDepartmentId: null
    });

    const concern = await concernService.createConcern(
      {
        title: "Portal issue",
        description: "Cannot log in",
        targetType: ConcernTargetType.OFFICE,
        targetOfficeId: "office-id",
        targetDepartmentId: null,
        visibility: ConcernVisibility.PRIVATE
      },
      { id: "student-user", role: UserRole.STUDENT }
    );

    expect(concern.id).toBe("concern-id");
    expect(mocks.repository.createConcern).toHaveBeenCalledOnce();
  });

  it("rejects invalid status transitions", async () => {
    mocks.repository.findAccessRecord.mockResolvedValue({
      id: "concern-id",
      status: ConcernStatus.IN_PROGRESS,
      targetOfficeId: "office-id"
    });
    mocks.repository.findOfficeStaffByUserId.mockResolvedValue({ officeId: "office-id" });

    await expect(
      concernService.updateConcernStatus(
        "concern-id",
        { status: "UNDER_REVIEW" },
        { id: "staff-user", role: UserRole.OFFICE_STAFF }
      )
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});
