/*
  Warnings:

  - Added the required column `targetType` to the `AppointmentAvailability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `AppointmentAvailability` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "rejectionReason" TEXT;

-- AlterTable
ALTER TABLE "AppointmentAvailability" ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "facultyId" TEXT,
ADD COLUMN     "officeId" TEXT,
ADD COLUMN     "targetType" "AppointmentTargetType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Appointment_officeId_status_startTime_idx" ON "Appointment"("officeId", "status", "startTime");

-- CreateIndex
CREATE INDEX "Appointment_departmentId_status_startTime_idx" ON "Appointment"("departmentId", "status", "startTime");

-- CreateIndex
CREATE INDEX "Appointment_facultyId_status_startTime_idx" ON "Appointment"("facultyId", "status", "startTime");

-- CreateIndex
CREATE INDEX "Appointment_studentId_status_startTime_idx" ON "Appointment"("studentId", "status", "startTime");

-- CreateIndex
CREATE INDEX "AppointmentAvailability_officeId_dayOfWeek_isActive_idx" ON "AppointmentAvailability"("officeId", "dayOfWeek", "isActive");

-- CreateIndex
CREATE INDEX "AppointmentAvailability_departmentId_dayOfWeek_isActive_idx" ON "AppointmentAvailability"("departmentId", "dayOfWeek", "isActive");

-- CreateIndex
CREATE INDEX "AppointmentAvailability_facultyId_dayOfWeek_isActive_idx" ON "AppointmentAvailability"("facultyId", "dayOfWeek", "isActive");

-- CreateIndex
CREATE INDEX "AppointmentAvailability_targetType_idx" ON "AppointmentAvailability"("targetType");

-- AddForeignKey
ALTER TABLE "AppointmentAvailability" ADD CONSTRAINT "AppointmentAvailability_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentAvailability" ADD CONSTRAINT "AppointmentAvailability_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentAvailability" ADD CONSTRAINT "AppointmentAvailability_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "FacultyProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
