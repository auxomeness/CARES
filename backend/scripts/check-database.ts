import { Prisma } from "@prisma/client";

import { prisma } from "../src/config/database";

type CountRow = { count: bigint };

async function count(query: Prisma.Sql): Promise<number> {
  const rows = await prisma.$queryRaw<CountRow[]>(query);
  return Number(rows[0]?.count ?? 0);
}

async function main(): Promise<void> {
  const checks = {
    studentRoleMismatches: await count(Prisma.sql`
      SELECT COUNT(*) AS count
      FROM "StudentProfile" profile
      JOIN "User" account ON account.id = profile."userId"
      WHERE account.role <> 'STUDENT'
    `),
    facultyRoleMismatches: await count(Prisma.sql`
      SELECT COUNT(*) AS count
      FROM "FacultyProfile" profile
      JOIN "User" account ON account.id = profile."userId"
      WHERE account.role::text <> profile.position::text
    `),
    officeStaffRoleMismatches: await count(Prisma.sql`
      SELECT COUNT(*) AS count
      FROM "OfficeStaffProfile" profile
      JOIN "User" account ON account.id = profile."userId"
      WHERE account.role <> 'OFFICE_STAFF'
    `),
    invalidConcernTargets: await count(Prisma.sql`
      SELECT COUNT(*) AS count
      FROM "Concern"
      WHERE NOT (
        ("targetType" = 'OFFICE' AND "targetOfficeId" IS NOT NULL AND "targetDepartmentId" IS NULL)
        OR
        ("targetType" = 'DEPARTMENT' AND "targetDepartmentId" IS NOT NULL AND "targetOfficeId" IS NULL)
      )
    `),
    invalidAppointmentTargets: await count(Prisma.sql`
      SELECT COUNT(*) AS count
      FROM "Appointment"
      WHERE NOT (
        ("targetType" = 'OFFICE' AND "officeId" IS NOT NULL AND "departmentId" IS NULL AND "facultyId" IS NULL)
        OR
        ("targetType" = 'DEPARTMENT' AND "departmentId" IS NOT NULL AND "officeId" IS NULL AND "facultyId" IS NULL)
        OR
        ("targetType" = 'PROFESSOR' AND "facultyId" IS NOT NULL AND "officeId" IS NULL AND "departmentId" IS NULL)
      )
    `),
    awaitingWithoutResolution: await count(Prisma.sql`
      SELECT COUNT(*) AS count
      FROM "Concern" concern
      LEFT JOIN "ResolutionReport" report ON report."concernId" = concern.id
      WHERE concern.status = 'AWAITING_CONFIRMATION' AND report.id IS NULL
    `)
  };

  const failures = Object.entries(checks).filter(([, value]) => value !== 0);
  if (failures.length > 0) {
    throw new Error(`Database integrity checks failed: ${JSON.stringify(checks)}`);
  }

  console.info(`Database integrity checks passed: ${JSON.stringify(checks)}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
