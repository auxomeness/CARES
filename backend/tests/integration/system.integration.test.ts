import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { app } from "../../src/app";
import { prisma } from "../../src/config/database";

const prefix = `FINAL-${Date.now()}`;
const suiteStartedAt = new Date();

let studentToken: string;
let secondStudentToken: string;
let officeToken: string;
let deanToken: string;
let officeId: string;
let departmentId: string;
let registeredUserId: string | undefined;

async function login(email: string): Promise<string> {
  const response = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password: "password123" })
    .expect(200);
  return response.body.data.accessToken as string;
}

function futureDate(days = 35): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(Date.now() + days * 86_400_000));
}

function isoWeekday(date: string): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    weekday: "short"
  }).format(new Date(`${date}T12:00:00+08:00`));
  return { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 }[weekday] as number;
}

function time(date: string, value: string): string {
  return new Date(`${date}T${value}:00+08:00`).toISOString();
}

beforeAll(async () => {
  [studentToken, secondStudentToken, officeToken, deanToken] = await Promise.all([
    login("student.maria@adnu.edu.ph"),
    login("student.juan@adnu.edu.ph"),
    login("office.staff@adnu.edu.ph"),
    login("cs.dean@adnu.edu.ph")
  ]);

  const [offices, departments] = await Promise.all([
    request(app)
      .get("/api/v1/directory/offices?search=MIS&page=1&limit=20")
      .set("Authorization", `Bearer ${studentToken}`)
      .expect(200),
    request(app)
      .get("/api/v1/directory/departments?search=Computer&page=1&limit=20")
      .set("Authorization", `Bearer ${studentToken}`)
      .expect(200)
  ]);
  officeId = offices.body.data[0].id as string;
  departmentId = departments.body.data[0].id as string;
});

afterAll(async () => {
  const concerns = await prisma.concern.findMany({
    where: { title: { startsWith: prefix } },
    select: { id: true }
  });
  const concernIds = concerns.map(({ id }) => id);
  const appointments = await prisma.appointment.findMany({
    where: { title: { startsWith: prefix } },
    select: { id: true }
  });
  const appointmentIds = appointments.map(({ id }) => id);

  if (concernIds.length > 0) {
    await prisma.concernSupport.deleteMany({ where: { concernId: { in: concernIds } } });
    await prisma.concernTimeline.deleteMany({ where: { concernId: { in: concernIds } } });
    await prisma.concernTransfer.deleteMany({ where: { concernId: { in: concernIds } } });
    await prisma.resolutionReport.deleteMany({ where: { concernId: { in: concernIds } } });
    await prisma.reopenRequest.deleteMany({ where: { concernId: { in: concernIds } } });
    await prisma.concernAttachment.deleteMany({ where: { concernId: { in: concernIds } } });
    await prisma.concern.deleteMany({ where: { id: { in: concernIds } } });
  }
  if (appointmentIds.length > 0) {
    await prisma.appointmentReschedule.deleteMany({
      where: { appointmentId: { in: appointmentIds } }
    });
    await prisma.appointment.deleteMany({ where: { id: { in: appointmentIds } } });
  }
  await prisma.appointmentAvailability.deleteMany({
    where: { createdAt: { gte: suiteStartedAt } }
  });
  await prisma.notification.deleteMany({ where: { createdAt: { gte: suiteStartedAt } } });
  if (registeredUserId) {
    await prisma.studentProfile.deleteMany({ where: { userId: registeredUserId } });
    await prisma.user.deleteMany({ where: { id: registeredUserId } });
  }
  await prisma.$disconnect();
});

describe("security and API standards", () => {
  it("registers a student, restores the session, and updates the profile", async () => {
    const email = `${prefix.toLowerCase()}@adnu.edu.ph`;
    const registered = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email,
        password: "Registration123!",
        firstName: "Integration",
        lastName: "Student",
        studentId: `${prefix}-SID`,
        course: "BS Computer Science",
        yearLevel: 2,
        departmentId
      })
      .expect(201);

    registeredUserId = registered.body.data.user.id as string;
    const token = registered.body.data.accessToken as string;

    const profile = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(profile.body.data.user.email).toBe(email);

    const updated = await request(app)
      .put("/api/v1/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ firstName: "Updated", course: "BS Information Technology" })
      .expect(200);
    expect(updated.body.data.user.firstName).toBe("Updated");
    expect(updated.body.data.user.studentProfile.course).toBe("BS Information Technology");
  });

  it("requires JWT authentication and rejects invalid or expired tokens", async () => {
    await request(app).get("/api/v1/notifications").expect(401);
    await request(app)
      .get("/api/v1/notifications")
      .set("Authorization", "Bearer invalid-token")
      .expect(401);

    const expiredToken = jwt.sign(
      { userId: "cm00000000000000000000001", role: "STUDENT" },
      process.env.JWT_SECRET as string,
      {
        algorithm: "HS256",
        expiresIn: -1,
        issuer: "cares-api",
        audience: "cares-client"
      }
    );
    await request(app)
      .get("/api/v1/notifications")
      .set("Authorization", `Bearer ${expiredToken}`)
      .expect(401);
  });

  it("returns standardized validation and RBAC errors", async () => {
    const validation = await request(app)
      .post("/api/v1/concerns")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ title: "", description: "" })
      .expect(400);
    expect(validation.body).toEqual(
      expect.objectContaining({
        success: false,
        message: "Validation failed",
        errors: expect.any(Array)
      })
    );

    await request(app)
      .post("/api/v1/offices")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        name: `${prefix} Office`,
        email: `${prefix.toLowerCase()}@adnu.edu.ph`
      })
      .expect(403);
  });

  it("restricts CORS and paginates every directory list", async () => {
    const blocked = await request(app)
      .get("/health")
      .set("Origin", "https://untrusted.example")
      .expect(200);
    expect(blocked.headers["access-control-allow-origin"]).toBeUndefined();

    const directory = await request(app)
      .get("/api/v1/directory/offices?page=1&limit=2")
      .set("Authorization", `Bearer ${studentToken}`)
      .expect(200);
    expect(directory.body.data).toHaveLength(2);
    expect(directory.body.meta).toEqual(
      expect.objectContaining({ page: 1, limit: 2, total: expect.any(Number) })
    );
  });
});

describe("concern integration flow", () => {
  it("runs create, transfer, reopen, resolve, and confirm with notifications", async () => {
    const created = await request(app)
      .post("/api/v1/concerns")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        title: `${prefix} Concern`,
        description: "Final integration concern flow.",
        targetType: "OFFICE",
        targetOfficeId: officeId,
        targetDepartmentId: null,
        visibility: "PUBLIC"
      })
      .expect(201);
    const concernId = created.body.data.concern.id as string;

    await request(app)
      .post(`/api/v1/concerns/${concernId}/support`)
      .set("Authorization", `Bearer ${secondStudentToken}`)
      .expect(201);
    await request(app)
      .post(`/api/v1/concerns/${concernId}/transfer`)
      .set("Authorization", `Bearer ${officeToken}`)
      .send({
        toTargetType: "DEPARTMENT",
        toOfficeId: null,
        toDepartmentId: departmentId,
        reason: "Academic review"
      })
      .expect(200);
    await request(app)
      .patch(`/api/v1/concerns/${concernId}/status`)
      .set("Authorization", `Bearer ${deanToken}`)
      .send({ status: "UNDER_REVIEW" })
      .expect(200);
    await request(app)
      .patch(`/api/v1/concerns/${concernId}/status`)
      .set("Authorization", `Bearer ${deanToken}`)
      .send({ status: "IN_PROGRESS" })
      .expect(200);
    await request(app)
      .post(`/api/v1/concerns/${concernId}/resolution`)
      .set("Authorization", `Bearer ${deanToken}`)
      .send({ summary: "First fix", actionsTaken: "Reviewed the concern." })
      .expect(201);
    await request(app)
      .post(`/api/v1/concerns/${concernId}/reject`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ reason: "Still unresolved" })
      .expect(200);
    await request(app)
      .patch(`/api/v1/concerns/${concernId}/status`)
      .set("Authorization", `Bearer ${deanToken}`)
      .send({ status: "IN_PROGRESS" })
      .expect(200);
    await request(app)
      .post(`/api/v1/concerns/${concernId}/resolution`)
      .set("Authorization", `Bearer ${deanToken}`)
      .send({ summary: "Final fix", actionsTaken: "Completed corrective action." })
      .expect(201);
    const confirmed = await request(app)
      .post(`/api/v1/concerns/${concernId}/confirm`)
      .set("Authorization", `Bearer ${studentToken}`)
      .expect(200);
    expect(confirmed.body.data.concern.status).toBe("RESOLVED");

    await new Promise((resolve) => setTimeout(resolve, 150));
    const notifications = await request(app)
      .get("/api/v1/notifications?page=1&limit=20")
      .set("Authorization", `Bearer ${studentToken}`)
      .expect(200);
    expect(notifications.body.data.length).toBeGreaterThan(0);
  });
});

describe("appointment integration flow", () => {
  it("runs create, approve, reschedule, complete, and rejects conflicts", async () => {
    const date = futureDate();
    await request(app)
      .post("/api/v1/availability")
      .set("Authorization", `Bearer ${officeToken}`)
      .send({
        dayOfWeek: isoWeekday(date),
        startTime: "09:00",
        endTime: "12:00",
        slotDuration: 30,
        isActive: true
      })
      .expect(201);

    const created = await request(app)
      .post("/api/v1/appointments")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        title: `${prefix} Appointment`,
        targetType: "OFFICE",
        officeId,
        departmentId: null,
        facultyId: null,
        startTime: time(date, "09:00"),
        endTime: time(date, "09:30")
      })
      .expect(201);
    const appointmentId = created.body.data.appointment.id as string;

    await request(app)
      .post("/api/v1/appointments")
      .set("Authorization", `Bearer ${secondStudentToken}`)
      .send({
        title: `${prefix} Conflict`,
        targetType: "OFFICE",
        officeId,
        departmentId: null,
        facultyId: null,
        startTime: time(date, "09:00"),
        endTime: time(date, "09:30")
      })
      .expect(409);
    await request(app)
      .patch(`/api/v1/appointments/${appointmentId}/approve`)
      .set("Authorization", `Bearer ${officeToken}`)
      .expect(200);
    await request(app)
      .post(`/api/v1/appointments/${appointmentId}/reschedule`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        newStartTime: time(date, "09:30"),
        newEndTime: time(date, "10:00"),
        reason: "Move one slot later"
      })
      .expect(200);
    await request(app)
      .patch(`/api/v1/appointments/${appointmentId}/approve`)
      .set("Authorization", `Bearer ${officeToken}`)
      .expect(200);
    const completed = await request(app)
      .patch(`/api/v1/appointments/${appointmentId}/complete`)
      .set("Authorization", `Bearer ${officeToken}`)
      .expect(200);
    expect(completed.body.data.appointment.status).toBe("COMPLETED");
  });
});
