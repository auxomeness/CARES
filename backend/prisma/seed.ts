import bcrypt from "bcrypt";
import { FacultyPosition, PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();
const PASSWORD = "password123";
const SALT_ROUNDS = 12;

type DepartmentSeed = {
  name: string;
  description: string;
  email: string;
  location: string;
  code: string;
};

type OfficeSeed = {
  name: string;
  description: string;
  email: string;
  location: string;
};

const offices: OfficeSeed[] = [
  {
    name: "OSA",
    description:
      "Office of Student Affairs for student services, conduct, and campus life concerns.",
    email: "osa@adnu.edu.ph",
    location: "Student Affairs Office"
  },
  {
    name: "Registrar",
    description: "Handles enrollment records, academic documents, and registration concerns.",
    email: "registrar@adnu.edu.ph",
    location: "Registrar Office"
  },
  {
    name: "Treasury",
    description: "Handles tuition, payment, billing, and financial transaction concerns.",
    email: "treasury@adnu.edu.ph",
    location: "Treasury Office"
  },
  {
    name: "MIS",
    description:
      "Management Information Systems office for portal and university systems concerns.",
    email: "mis@adnu.edu.ph",
    location: "MIS Office"
  },
  {
    name: "NOCS",
    description:
      "Network Operations and Computer Services for connectivity and infrastructure concerns.",
    email: "nocs@adnu.edu.ph",
    location: "NOCS Office"
  },
  {
    name: "Guidance",
    description: "Guidance services for counseling, student support, and wellness appointments.",
    email: "guidance@adnu.edu.ph",
    location: "Guidance Center"
  },
  {
    name: "Scholarship",
    description: "Scholarship office for grants, aid, and scholarship document concerns.",
    email: "scholarship@adnu.edu.ph",
    location: "Scholarship Office"
  },
  {
    name: "Library",
    description:
      "University library services for circulation, resources, and study-space concerns.",
    email: "library@adnu.edu.ph",
    location: "University Library"
  }
];

const departments: DepartmentSeed[] = [
  {
    name: "Computer Studies",
    description:
      "Department handling computer science, information systems, and computing programs.",
    email: "computerstudies@adnu.edu.ph",
    location: "Computer Studies Department",
    code: "CS"
  },
  {
    name: "Engineering",
    description: "Department handling engineering programs, laboratories, and academic concerns.",
    email: "engineering@adnu.edu.ph",
    location: "Engineering Department",
    code: "ENG"
  },
  {
    name: "Business",
    description: "Department handling business, management, and accountancy programs.",
    email: "business@adnu.edu.ph",
    location: "Business Department",
    code: "BUS"
  },
  {
    name: "Education",
    description: "Department handling teacher education and education-related academic programs.",
    email: "education@adnu.edu.ph",
    location: "Education Department",
    code: "EDU"
  },
  {
    name: "Nursing",
    description:
      "Department handling nursing programs, clinical coordination, and academic concerns.",
    email: "nursing@adnu.edu.ph",
    location: "Nursing Department",
    code: "NUR"
  }
];

const students = [
  {
    email: "student.maria@adnu.edu.ph",
    firstName: "Maria",
    lastName: "Santos",
    studentId: "2026-0001",
    course: "BS Information Technology",
    yearLevel: 1,
    departmentName: "Computer Studies"
  },
  {
    email: "student.juan@adnu.edu.ph",
    firstName: "Juan",
    lastName: "Dela Cruz",
    studentId: "2026-0002",
    course: "BS Civil Engineering",
    yearLevel: 2,
    departmentName: "Engineering"
  },
  {
    email: "student.ana@adnu.edu.ph",
    firstName: "Ana",
    lastName: "Reyes",
    studentId: "2026-0003",
    course: "BS Business Administration",
    yearLevel: 3,
    departmentName: "Business"
  },
  {
    email: "student.paolo@adnu.edu.ph",
    firstName: "Paolo",
    lastName: "Garcia",
    studentId: "2026-0004",
    course: "Bachelor of Elementary Education",
    yearLevel: 4,
    departmentName: "Education"
  },
  {
    email: "student.lara@adnu.edu.ph",
    firstName: "Lara",
    lastName: "Villanueva",
    studentId: "2026-0005",
    course: "BS Nursing",
    yearLevel: 2,
    departmentName: "Nursing"
  }
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/(^\.|\.$)/g, "");
}

async function upsertUser(input: {
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  role: UserRole;
  passwordHash: string;
}) {
  return prisma.user.upsert({
    where: { email: input.email },
    update: {
      firstName: input.firstName,
      middleName: input.middleName,
      lastName: input.lastName,
      role: input.role,
      password: input.passwordHash,
      isActive: true
    },
    create: {
      email: input.email,
      firstName: input.firstName,
      middleName: input.middleName,
      lastName: input.lastName,
      role: input.role,
      password: input.passwordHash,
      isActive: true
    }
  });
}

async function seedUsers(passwordHash: string): Promise<void> {
  await upsertUser({
    email: "admin@adnu.edu.ph",
    firstName: "System",
    lastName: "Administrator",
    role: UserRole.ADMIN,
    passwordHash
  });
}

async function seedDepartments() {
  const records = await Promise.all(
    departments.map((department) =>
      prisma.department.upsert({
        where: { name: department.name },
        update: {
          description: department.description,
          email: department.email,
          location: department.location
        },
        create: {
          name: department.name,
          description: department.description,
          email: department.email,
          location: department.location
        }
      })
    )
  );

  return new Map(records.map((department) => [department.name, department]));
}

async function seedOffices() {
  const records = await Promise.all(
    offices.map((office) =>
      prisma.office.upsert({
        where: { name: office.name },
        update: {
          description: office.description,
          email: office.email,
          location: office.location
        },
        create: office
      })
    )
  );

  return new Map(records.map((office) => [office.name, office]));
}

async function seedOfficeStaff(
  officeMap: Awaited<ReturnType<typeof seedOffices>>,
  passwordHash: string
): Promise<void> {
  const office = officeMap.get("MIS");

  if (!office) {
    throw new Error("MIS office not found after seed");
  }

  const user = await upsertUser({
    email: "office.staff@adnu.edu.ph",
    firstName: "Office",
    lastName: "Staff",
    role: UserRole.OFFICE_STAFF,
    passwordHash
  });

  await prisma.officeStaffProfile.upsert({
    where: { userId: user.id },
    update: { officeId: office.id },
    create: {
      userId: user.id,
      officeId: office.id
    }
  });
}

async function seedFaculty(
  departmentMap: Awaited<ReturnType<typeof seedDepartments>>,
  passwordHash: string
): Promise<void> {
  for (const departmentSeed of departments) {
    const department = departmentMap.get(departmentSeed.name);

    if (!department) {
      throw new Error(`Department not found after seed: ${departmentSeed.name}`);
    }

    const facultySeeds = [
      {
        firstName: `${departmentSeed.code}`,
        lastName: "Dean",
        role: UserRole.DEAN,
        position: FacultyPosition.DEAN,
        employeeId: `${departmentSeed.code}-DEAN-001`
      },
      {
        firstName: `${departmentSeed.code}`,
        lastName: "Chair",
        role: UserRole.CHAIR,
        position: FacultyPosition.CHAIR,
        employeeId: `${departmentSeed.code}-CHAIR-001`
      },
      {
        firstName: `${departmentSeed.code}`,
        lastName: "Professor One",
        role: UserRole.PROFESSOR,
        position: FacultyPosition.PROFESSOR,
        employeeId: `${departmentSeed.code}-PROF-001`
      },
      {
        firstName: `${departmentSeed.code}`,
        lastName: "Professor Two",
        role: UserRole.PROFESSOR,
        position: FacultyPosition.PROFESSOR,
        employeeId: `${departmentSeed.code}-PROF-002`
      }
    ];

    for (const faculty of facultySeeds) {
      const email = `${slugify(departmentSeed.code)}.${slugify(faculty.lastName)}@adnu.edu.ph`;
      const user = await upsertUser({
        email,
        firstName: faculty.firstName,
        lastName: faculty.lastName,
        role: faculty.role,
        passwordHash
      });

      await prisma.facultyProfile.upsert({
        where: { employeeId: faculty.employeeId },
        update: {
          userId: user.id,
          departmentId: department.id,
          position: faculty.position
        },
        create: {
          userId: user.id,
          employeeId: faculty.employeeId,
          departmentId: department.id,
          position: faculty.position
        }
      });
    }
  }
}

async function seedStudents(
  departmentMap: Awaited<ReturnType<typeof seedDepartments>>,
  passwordHash: string
): Promise<void> {
  for (const studentSeed of students) {
    const department = departmentMap.get(studentSeed.departmentName);

    if (!department) {
      throw new Error(`Department not found after seed: ${studentSeed.departmentName}`);
    }

    const user = await upsertUser({
      email: studentSeed.email,
      firstName: studentSeed.firstName,
      lastName: studentSeed.lastName,
      role: UserRole.STUDENT,
      passwordHash
    });

    await prisma.studentProfile.upsert({
      where: { studentId: studentSeed.studentId },
      update: {
        userId: user.id,
        course: studentSeed.course,
        yearLevel: studentSeed.yearLevel,
        departmentId: department.id
      },
      create: {
        userId: user.id,
        studentId: studentSeed.studentId,
        course: studentSeed.course,
        yearLevel: studentSeed.yearLevel,
        departmentId: department.id
      }
    });
  }
}

async function validateSeedData(): Promise<void> {
  const roleCounts = await prisma.user.groupBy({
    by: ["role"],
    _count: { role: true }
  });
  const roles = new Set(roleCounts.map((roleCount) => roleCount.role));

  for (const role of Object.values(UserRole)) {
    if (!roles.has(role)) {
      throw new Error(`Missing seeded users for role: ${role}`);
    }
  }

  const [facultyCount, studentCount, officeCount, departmentCount, officeStaffCount] =
    await Promise.all([
      prisma.facultyProfile.count(),
      prisma.studentProfile.count(),
      prisma.office.count(),
      prisma.department.count(),
      prisma.officeStaffProfile.count()
    ]);

  if (officeCount < offices.length) {
    throw new Error(`Expected at least ${offices.length} offices, found ${officeCount}`);
  }

  if (departmentCount < departments.length) {
    throw new Error(
      `Expected at least ${departments.length} departments, found ${departmentCount}`
    );
  }

  if (facultyCount < departments.length * 4) {
    throw new Error(
      `Expected at least ${departments.length * 4} faculty profiles, found ${facultyCount}`
    );
  }

  if (studentCount < students.length) {
    throw new Error(`Expected at least ${students.length} student profiles, found ${studentCount}`);
  }

  if (officeStaffCount < 1) {
    throw new Error("Expected at least one office staff profile");
  }
}

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(PASSWORD, SALT_ROUNDS);

  await seedUsers(passwordHash);
  const departmentMap = await seedDepartments();
  const officeMap = await seedOffices();
  await seedOfficeStaff(officeMap, passwordHash);
  await seedFaculty(departmentMap, passwordHash);
  await seedStudents(departmentMap, passwordHash);
  await validateSeedData();

  console.info("CARES seed data completed successfully.");
}

main()
  .catch((error) => {
    console.error("CARES seed data failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
