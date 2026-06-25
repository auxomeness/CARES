CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Appointment"
ADD CONSTRAINT "Appointment_target_xor_check"
CHECK (
  (
    "targetType" = 'OFFICE'
    AND "officeId" IS NOT NULL
    AND "departmentId" IS NULL
    AND "facultyId" IS NULL
  )
  OR
  (
    "targetType" = 'DEPARTMENT'
    AND "departmentId" IS NOT NULL
    AND "officeId" IS NULL
    AND "facultyId" IS NULL
  )
  OR
  (
    "targetType" = 'PROFESSOR'
    AND "facultyId" IS NOT NULL
    AND "officeId" IS NULL
    AND "departmentId" IS NULL
  )
);

ALTER TABLE "Appointment"
ADD CONSTRAINT "Appointment_time_range_check"
CHECK ("endTime" > "startTime");

ALTER TABLE "AppointmentAvailability"
ADD CONSTRAINT "AppointmentAvailability_target_xor_check"
CHECK (
  (
    "targetType" = 'OFFICE'
    AND "officeId" IS NOT NULL
    AND "departmentId" IS NULL
    AND "facultyId" IS NULL
  )
  OR
  (
    "targetType" = 'DEPARTMENT'
    AND "departmentId" IS NOT NULL
    AND "officeId" IS NULL
    AND "facultyId" IS NULL
  )
  OR
  (
    "targetType" = 'PROFESSOR'
    AND "facultyId" IS NOT NULL
    AND "officeId" IS NULL
    AND "departmentId" IS NULL
  )
);

ALTER TABLE "AppointmentAvailability"
ADD CONSTRAINT "AppointmentAvailability_day_check"
CHECK ("dayOfWeek" BETWEEN 1 AND 7);

ALTER TABLE "AppointmentAvailability"
ADD CONSTRAINT "AppointmentAvailability_time_check"
CHECK (
  "startTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
  AND "endTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
  AND "endTime" > "startTime"
  AND "slotDuration" BETWEEN 5 AND 480
);

ALTER TABLE "Appointment"
ADD CONSTRAINT "Appointment_student_no_overlap"
EXCLUDE USING gist (
  "studentId" WITH =,
  tsrange("startTime", "endTime", '[)') WITH &&
)
WHERE ("status" IN ('PENDING', 'APPROVED', 'RESCHEDULED'));

ALTER TABLE "Appointment"
ADD CONSTRAINT "Appointment_office_no_overlap"
EXCLUDE USING gist (
  "officeId" WITH =,
  tsrange("startTime", "endTime", '[)') WITH &&
)
WHERE (
  "officeId" IS NOT NULL
  AND "status" IN ('PENDING', 'APPROVED', 'RESCHEDULED')
);

ALTER TABLE "Appointment"
ADD CONSTRAINT "Appointment_department_no_overlap"
EXCLUDE USING gist (
  "departmentId" WITH =,
  tsrange("startTime", "endTime", '[)') WITH &&
)
WHERE (
  "departmentId" IS NOT NULL
  AND "status" IN ('PENDING', 'APPROVED', 'RESCHEDULED')
);

ALTER TABLE "Appointment"
ADD CONSTRAINT "Appointment_faculty_no_overlap"
EXCLUDE USING gist (
  "facultyId" WITH =,
  tsrange("startTime", "endTime", '[)') WITH &&
)
WHERE (
  "facultyId" IS NOT NULL
  AND "status" IN ('PENDING', 'APPROVED', 'RESCHEDULED')
);
