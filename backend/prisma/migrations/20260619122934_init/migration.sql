-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STUDENT', 'OFFICE_STAFF', 'DEAN', 'CHAIR', 'PROFESSOR');

-- CreateEnum
CREATE TYPE "FacultyPosition" AS ENUM ('DEAN', 'CHAIR', 'PROFESSOR');

-- CreateEnum
CREATE TYPE "ConcernStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'TRANSFERRED', 'AWAITING_CONFIRMATION', 'REOPENED', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ConcernVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "ConcernTargetType" AS ENUM ('OFFICE', 'DEPARTMENT');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AppointmentTargetType" AS ENUM ('OFFICE', 'DEPARTMENT', 'PROFESSOR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "yearLevel" INTEGER NOT NULL,
    "departmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacultyProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "position" "FacultyPosition" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacultyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "email" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Office" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "email" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Office_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Concern" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ConcernStatus" NOT NULL DEFAULT 'SUBMITTED',
    "visibility" "ConcernVisibility" NOT NULL DEFAULT 'PRIVATE',
    "targetType" "ConcernTargetType" NOT NULL,
    "targetOfficeId" TEXT,
    "targetDepartmentId" TEXT,
    "submittedById" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Concern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConcernAttachment" (
    "id" TEXT NOT NULL,
    "concernId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConcernAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConcernSupport" (
    "id" TEXT NOT NULL,
    "concernId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConcernSupport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConcernTimeline" (
    "id" TEXT NOT NULL,
    "concernId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConcernTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConcernTransfer" (
    "id" TEXT NOT NULL,
    "concernId" TEXT NOT NULL,
    "transferredById" TEXT NOT NULL,
    "fromTargetType" "ConcernTargetType" NOT NULL,
    "fromOfficeId" TEXT,
    "fromDepartmentId" TEXT,
    "toTargetType" "ConcernTargetType" NOT NULL,
    "toOfficeId" TEXT,
    "toDepartmentId" TEXT,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConcernTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResolutionReport" (
    "id" TEXT NOT NULL,
    "concernId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "actionsTaken" TEXT NOT NULL,
    "evidenceUrl" TEXT,
    "resolvedById" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResolutionReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReopenRequest" (
    "id" TEXT NOT NULL,
    "concernId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReopenRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "studentId" TEXT NOT NULL,
    "targetType" "AppointmentTargetType" NOT NULL,
    "officeId" TEXT,
    "departmentId" TEXT,
    "facultyId" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentAvailability" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "slotDuration" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentReschedule" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "oldStartTime" TIMESTAMP(3) NOT NULL,
    "oldEndTime" TIMESTAMP(3) NOT NULL,
    "newStartTime" TIMESTAMP(3) NOT NULL,
    "newEndTime" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentReschedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE INDEX "User_lastName_firstName_idx" ON "User"("lastName", "firstName");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_studentId_key" ON "StudentProfile"("studentId");

-- CreateIndex
CREATE INDEX "StudentProfile_departmentId_idx" ON "StudentProfile"("departmentId");

-- CreateIndex
CREATE INDEX "StudentProfile_course_idx" ON "StudentProfile"("course");

-- CreateIndex
CREATE INDEX "StudentProfile_yearLevel_idx" ON "StudentProfile"("yearLevel");

-- CreateIndex
CREATE UNIQUE INDEX "FacultyProfile_userId_key" ON "FacultyProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FacultyProfile_employeeId_key" ON "FacultyProfile"("employeeId");

-- CreateIndex
CREATE INDEX "FacultyProfile_departmentId_idx" ON "FacultyProfile"("departmentId");

-- CreateIndex
CREATE INDEX "FacultyProfile_position_idx" ON "FacultyProfile"("position");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE INDEX "Department_name_idx" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Office_name_key" ON "Office"("name");

-- CreateIndex
CREATE INDEX "Office_name_idx" ON "Office"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Concern_referenceNumber_key" ON "Concern"("referenceNumber");

-- CreateIndex
CREATE INDEX "Concern_status_idx" ON "Concern"("status");

-- CreateIndex
CREATE INDEX "Concern_visibility_idx" ON "Concern"("visibility");

-- CreateIndex
CREATE INDEX "Concern_submittedById_idx" ON "Concern"("submittedById");

-- CreateIndex
CREATE INDEX "Concern_targetOfficeId_idx" ON "Concern"("targetOfficeId");

-- CreateIndex
CREATE INDEX "Concern_targetDepartmentId_idx" ON "Concern"("targetDepartmentId");

-- CreateIndex
CREATE INDEX "Concern_targetType_idx" ON "Concern"("targetType");

-- CreateIndex
CREATE INDEX "Concern_createdAt_idx" ON "Concern"("createdAt");

-- CreateIndex
CREATE INDEX "ConcernAttachment_concernId_idx" ON "ConcernAttachment"("concernId");

-- CreateIndex
CREATE INDEX "ConcernAttachment_uploadedAt_idx" ON "ConcernAttachment"("uploadedAt");

-- CreateIndex
CREATE INDEX "ConcernSupport_concernId_idx" ON "ConcernSupport"("concernId");

-- CreateIndex
CREATE INDEX "ConcernSupport_studentId_idx" ON "ConcernSupport"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "ConcernSupport_concernId_studentId_key" ON "ConcernSupport"("concernId", "studentId");

-- CreateIndex
CREATE INDEX "ConcernTimeline_concernId_idx" ON "ConcernTimeline"("concernId");

-- CreateIndex
CREATE INDEX "ConcernTimeline_actorId_idx" ON "ConcernTimeline"("actorId");

-- CreateIndex
CREATE INDEX "ConcernTimeline_eventType_idx" ON "ConcernTimeline"("eventType");

-- CreateIndex
CREATE INDEX "ConcernTimeline_createdAt_idx" ON "ConcernTimeline"("createdAt");

-- CreateIndex
CREATE INDEX "ConcernTransfer_concernId_idx" ON "ConcernTransfer"("concernId");

-- CreateIndex
CREATE INDEX "ConcernTransfer_transferredById_idx" ON "ConcernTransfer"("transferredById");

-- CreateIndex
CREATE INDEX "ConcernTransfer_fromOfficeId_idx" ON "ConcernTransfer"("fromOfficeId");

-- CreateIndex
CREATE INDEX "ConcernTransfer_fromDepartmentId_idx" ON "ConcernTransfer"("fromDepartmentId");

-- CreateIndex
CREATE INDEX "ConcernTransfer_toOfficeId_idx" ON "ConcernTransfer"("toOfficeId");

-- CreateIndex
CREATE INDEX "ConcernTransfer_toDepartmentId_idx" ON "ConcernTransfer"("toDepartmentId");

-- CreateIndex
CREATE INDEX "ConcernTransfer_createdAt_idx" ON "ConcernTransfer"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ResolutionReport_concernId_key" ON "ResolutionReport"("concernId");

-- CreateIndex
CREATE INDEX "ResolutionReport_resolvedById_idx" ON "ResolutionReport"("resolvedById");

-- CreateIndex
CREATE INDEX "ResolutionReport_resolvedAt_idx" ON "ResolutionReport"("resolvedAt");

-- CreateIndex
CREATE INDEX "ReopenRequest_concernId_idx" ON "ReopenRequest"("concernId");

-- CreateIndex
CREATE INDEX "ReopenRequest_studentId_idx" ON "ReopenRequest"("studentId");

-- CreateIndex
CREATE INDEX "ReopenRequest_createdAt_idx" ON "ReopenRequest"("createdAt");

-- CreateIndex
CREATE INDEX "Appointment_studentId_idx" ON "Appointment"("studentId");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE INDEX "Appointment_startTime_idx" ON "Appointment"("startTime");

-- CreateIndex
CREATE INDEX "Appointment_officeId_idx" ON "Appointment"("officeId");

-- CreateIndex
CREATE INDEX "Appointment_departmentId_idx" ON "Appointment"("departmentId");

-- CreateIndex
CREATE INDEX "Appointment_facultyId_idx" ON "Appointment"("facultyId");

-- CreateIndex
CREATE INDEX "Appointment_targetType_idx" ON "Appointment"("targetType");

-- CreateIndex
CREATE INDEX "AppointmentAvailability_ownerUserId_idx" ON "AppointmentAvailability"("ownerUserId");

-- CreateIndex
CREATE INDEX "AppointmentAvailability_dayOfWeek_idx" ON "AppointmentAvailability"("dayOfWeek");

-- CreateIndex
CREATE INDEX "AppointmentAvailability_isActive_idx" ON "AppointmentAvailability"("isActive");

-- CreateIndex
CREATE INDEX "AppointmentReschedule_appointmentId_idx" ON "AppointmentReschedule"("appointmentId");

-- CreateIndex
CREATE INDEX "AppointmentReschedule_requestedById_idx" ON "AppointmentReschedule"("requestedById");

-- CreateIndex
CREATE INDEX "AppointmentReschedule_createdAt_idx" ON "AppointmentReschedule"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacultyProfile" ADD CONSTRAINT "FacultyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacultyProfile" ADD CONSTRAINT "FacultyProfile_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Concern" ADD CONSTRAINT "Concern_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Concern" ADD CONSTRAINT "Concern_targetOfficeId_fkey" FOREIGN KEY ("targetOfficeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Concern" ADD CONSTRAINT "Concern_targetDepartmentId_fkey" FOREIGN KEY ("targetDepartmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConcernAttachment" ADD CONSTRAINT "ConcernAttachment_concernId_fkey" FOREIGN KEY ("concernId") REFERENCES "Concern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConcernSupport" ADD CONSTRAINT "ConcernSupport_concernId_fkey" FOREIGN KEY ("concernId") REFERENCES "Concern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConcernSupport" ADD CONSTRAINT "ConcernSupport_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConcernTimeline" ADD CONSTRAINT "ConcernTimeline_concernId_fkey" FOREIGN KEY ("concernId") REFERENCES "Concern"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConcernTimeline" ADD CONSTRAINT "ConcernTimeline_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConcernTransfer" ADD CONSTRAINT "ConcernTransfer_concernId_fkey" FOREIGN KEY ("concernId") REFERENCES "Concern"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConcernTransfer" ADD CONSTRAINT "ConcernTransfer_transferredById_fkey" FOREIGN KEY ("transferredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConcernTransfer" ADD CONSTRAINT "ConcernTransfer_fromOfficeId_fkey" FOREIGN KEY ("fromOfficeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConcernTransfer" ADD CONSTRAINT "ConcernTransfer_fromDepartmentId_fkey" FOREIGN KEY ("fromDepartmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConcernTransfer" ADD CONSTRAINT "ConcernTransfer_toOfficeId_fkey" FOREIGN KEY ("toOfficeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConcernTransfer" ADD CONSTRAINT "ConcernTransfer_toDepartmentId_fkey" FOREIGN KEY ("toDepartmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResolutionReport" ADD CONSTRAINT "ResolutionReport_concernId_fkey" FOREIGN KEY ("concernId") REFERENCES "Concern"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResolutionReport" ADD CONSTRAINT "ResolutionReport_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReopenRequest" ADD CONSTRAINT "ReopenRequest_concernId_fkey" FOREIGN KEY ("concernId") REFERENCES "Concern"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReopenRequest" ADD CONSTRAINT "ReopenRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "FacultyProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentAvailability" ADD CONSTRAINT "AppointmentAvailability_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentReschedule" ADD CONSTRAINT "AppointmentReschedule_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentReschedule" ADD CONSTRAINT "AppointmentReschedule_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
