-- Run this on your database to add college department and course columns to UserInformation.
-- Required for mobile register-info (Complete Profile) to save department and course.
-- MySQL / MariaDB:

ALTER TABLE `UserInformation`
  ADD COLUMN `collegeDepartment` VARCHAR(255) NULL,
  ADD COLUMN `course` VARCHAR(255) NULL;
