-- CreateTable
CREATE TABLE "OfficeStaffProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "officeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficeStaffProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OfficeStaffProfile_userId_key" ON "OfficeStaffProfile"("userId");

-- CreateIndex
CREATE INDEX "OfficeStaffProfile_officeId_idx" ON "OfficeStaffProfile"("officeId");

-- CreateIndex
CREATE INDEX "Concern_targetOfficeId_status_idx" ON "Concern"("targetOfficeId", "status");

-- CreateIndex
CREATE INDEX "Concern_targetDepartmentId_status_idx" ON "Concern"("targetDepartmentId", "status");

-- AddForeignKey
ALTER TABLE "OfficeStaffProfile" ADD CONSTRAINT "OfficeStaffProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeStaffProfile" ADD CONSTRAINT "OfficeStaffProfile_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
