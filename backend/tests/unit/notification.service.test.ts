import { UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  repository: {
    findUserById: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    markReadState: vi.fn(),
    findAllForUser: vi.fn(),
    countForUser: vi.fn(),
    countUnreadForUser: vi.fn()
  }
}));

vi.mock("../../src/modules/notifications/repository/notification.repository", () => ({
  notificationRepository: mocks.repository
}));

import { notificationService } from "../../src/modules/notifications/service/notification.service";

const actor = { id: "user-id", role: UserRole.STUDENT };

describe("notificationService", () => {
  beforeEach(() => {
    Object.values(mocks.repository).forEach((mock) => mock.mockReset());
  });

  it("creates notifications only for active users", async () => {
    mocks.repository.findUserById.mockResolvedValue({ id: actor.id, isActive: true });
    mocks.repository.create.mockResolvedValue({ id: "notification-id" });

    const result = await notificationService.createNotification({
      userId: actor.id,
      title: "Title",
      message: "Message"
    });

    expect(result.id).toBe("notification-id");
  });

  it("prevents users from reading another user's notification", async () => {
    mocks.repository.findById.mockResolvedValue({
      id: "notification-id",
      userId: "different-user"
    });

    await expect(notificationService.markAsRead("notification-id", actor)).rejects.toMatchObject({
      statusCode: 403
    });
  });
});
