ALTER TABLE "Concern"
ADD CONSTRAINT "Concern_target_xor_check"
CHECK (
  (
    "targetType" = 'OFFICE'
    AND "targetOfficeId" IS NOT NULL
    AND "targetDepartmentId" IS NULL
  )
  OR
  (
    "targetType" = 'DEPARTMENT'
    AND "targetDepartmentId" IS NOT NULL
    AND "targetOfficeId" IS NULL
  )
);

ALTER TABLE "ConcernTransfer"
ADD CONSTRAINT "ConcernTransfer_from_target_xor_check"
CHECK (
  (
    "fromTargetType" = 'OFFICE'
    AND "fromOfficeId" IS NOT NULL
    AND "fromDepartmentId" IS NULL
  )
  OR
  (
    "fromTargetType" = 'DEPARTMENT'
    AND "fromDepartmentId" IS NOT NULL
    AND "fromOfficeId" IS NULL
  )
);

ALTER TABLE "ConcernTransfer"
ADD CONSTRAINT "ConcernTransfer_to_target_xor_check"
CHECK (
  (
    "toTargetType" = 'OFFICE'
    AND "toOfficeId" IS NOT NULL
    AND "toDepartmentId" IS NULL
  )
  OR
  (
    "toTargetType" = 'DEPARTMENT'
    AND "toDepartmentId" IS NOT NULL
    AND "toOfficeId" IS NULL
  )
);
