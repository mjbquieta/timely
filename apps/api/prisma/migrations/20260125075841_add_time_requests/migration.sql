-- CreateEnum
CREATE TYPE "HolidayType" AS ENUM ('REGULAR_HOLIDAY', 'SPECIAL_NON_WORKING_HOLIDAY', 'COMPANY_HOLIDAY');

-- CreateEnum
CREATE TYPE "RestDayScheduleType" AS ENUM ('FIXED_WEEKLY', 'ROTATING');

-- CreateEnum
CREATE TYPE "PayrollCutoffStatus" AS ENUM ('DRAFT', 'ACTIVE', 'LOCKED', 'RELEASED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOCK', 'UNLOCK', 'OVERRIDE');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('HOLIDAY', 'REST_DAY_RULE', 'PAYROLL_CUTOFF', 'TIME_REQUEST', 'LEAVE_BALANCE');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('VL', 'SL', 'EL', 'ML', 'PL', 'LWOP');

-- CreateEnum
CREATE TYPE "TimeRequestType" AS ENUM ('LEAVE', 'OVERTIME', 'UNDERTIME');

-- CreateEnum
CREATE TYPE "TimeRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'INCLUDED_IN_PAYROLL');

-- CreateEnum
CREATE TYPE "HalfDayType" AS ENUM ('NONE', 'AM', 'PM');

-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "payroll_cutoff_id" TEXT;

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "performed_by" TEXT NOT NULL,
    "performed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "before_snapshot" JSONB,
    "after_snapshot" JSONB,
    "reason" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holidays" (
    "id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "HolidayType" NOT NULL,
    "start_date" TEXT NOT NULL,
    "end_date" TEXT,
    "is_paid" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "effective_start_date" TIMESTAMP(3) NOT NULL,
    "effective_end_date" TIMESTAMP(3),
    "is_current_version" BOOLEAN NOT NULL DEFAULT true,
    "previous_version_id" TEXT,
    "is_used_in_payroll" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rest_day_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schedule_type" "RestDayScheduleType" NOT NULL,
    "fixed_days" INTEGER[],
    "work_days" INTEGER,
    "rest_days" INTEGER,
    "pattern_start_date" TEXT,
    "branch_id" TEXT,
    "department_id" TEXT,
    "user_id" TEXT,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "previous_version_id" TEXT,
    "is_current_version" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,

    CONSTRAINT "rest_day_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_cutoffs" (
    "id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "period_start_date" TIMESTAMP(3) NOT NULL,
    "period_start_time" TEXT NOT NULL,
    "period_end_date" TIMESTAMP(3) NOT NULL,
    "period_end_time" TEXT NOT NULL,
    "release_date" TIMESTAMP(3),
    "status" "PayrollCutoffStatus" NOT NULL DEFAULT 'DRAFT',
    "locked_at" TIMESTAMP(3),
    "locked_by" TEXT,
    "last_override_at" TIMESTAMP(3),
    "last_override_by" TEXT,
    "last_override_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,

    CONSTRAINT "payroll_cutoffs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_requests" (
    "id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "TimeRequestType" NOT NULL,
    "status" "TimeRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT NOT NULL,
    "attachment_url" TEXT,
    "leave_type" "LeaveType",
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "half_day_type" "HalfDayType" DEFAULT 'NONE',
    "ot_date" TIMESTAMP(3),
    "ot_start_time" TEXT,
    "ot_end_time" TEXT,
    "ot_total_minutes" INTEGER,
    "ut_date" TIMESTAMP(3),
    "ut_start_time" TEXT,
    "ut_end_time" TEXT,
    "ut_total_minutes" INTEGER,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "reviewer_remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "time_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_balances" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "leave_type" "LeaveType" NOT NULL,
    "year" INTEGER NOT NULL,
    "total_allowance" DOUBLE PRECISION NOT NULL,
    "used_days" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pending_days" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "overtime_policies" (
    "id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "max_daily_ot_minutes" INTEGER NOT NULL DEFAULT 240,
    "max_weekly_ot_minutes" INTEGER NOT NULL DEFAULT 480,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "overtime_policies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_performed_by_idx" ON "audit_logs"("performed_by");

-- CreateIndex
CREATE INDEX "audit_logs_performed_at_idx" ON "audit_logs"("performed_at");

-- CreateIndex
CREATE INDEX "holidays_branch_id_is_current_version_idx" ON "holidays"("branch_id", "is_current_version");

-- CreateIndex
CREATE INDEX "holidays_start_date_end_date_idx" ON "holidays"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "rest_day_rules_branch_id_is_current_version_idx" ON "rest_day_rules"("branch_id", "is_current_version");

-- CreateIndex
CREATE INDEX "rest_day_rules_user_id_is_current_version_idx" ON "rest_day_rules"("user_id", "is_current_version");

-- CreateIndex
CREATE INDEX "rest_day_rules_department_id_is_current_version_idx" ON "rest_day_rules"("department_id", "is_current_version");

-- CreateIndex
CREATE INDEX "rest_day_rules_effective_from_effective_to_idx" ON "rest_day_rules"("effective_from", "effective_to");

-- CreateIndex
CREATE INDEX "payroll_cutoffs_branch_id_status_idx" ON "payroll_cutoffs"("branch_id", "status");

-- CreateIndex
CREATE INDEX "payroll_cutoffs_period_start_date_period_end_date_idx" ON "payroll_cutoffs"("period_start_date", "period_end_date");

-- CreateIndex
CREATE INDEX "time_requests_branch_id_type_status_idx" ON "time_requests"("branch_id", "type", "status");

-- CreateIndex
CREATE INDEX "time_requests_user_id_type_idx" ON "time_requests"("user_id", "type");

-- CreateIndex
CREATE INDEX "time_requests_start_date_end_date_idx" ON "time_requests"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "leave_balances_branch_id_year_idx" ON "leave_balances"("branch_id", "year");

-- CreateIndex
CREATE UNIQUE INDEX "leave_balances_user_id_leave_type_year_key" ON "leave_balances"("user_id", "leave_type", "year");

-- CreateIndex
CREATE UNIQUE INDEX "overtime_policies_branch_id_key" ON "overtime_policies"("branch_id");

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_payroll_cutoff_id_fkey" FOREIGN KEY ("payroll_cutoff_id") REFERENCES "payroll_cutoffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holidays" ADD CONSTRAINT "holidays_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holidays" ADD CONSTRAINT "holidays_previous_version_id_fkey" FOREIGN KEY ("previous_version_id") REFERENCES "holidays"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holidays" ADD CONSTRAINT "holidays_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rest_day_rules" ADD CONSTRAINT "rest_day_rules_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rest_day_rules" ADD CONSTRAINT "rest_day_rules_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rest_day_rules" ADD CONSTRAINT "rest_day_rules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rest_day_rules" ADD CONSTRAINT "rest_day_rules_previous_version_id_fkey" FOREIGN KEY ("previous_version_id") REFERENCES "rest_day_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rest_day_rules" ADD CONSTRAINT "rest_day_rules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_cutoffs" ADD CONSTRAINT "payroll_cutoffs_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_cutoffs" ADD CONSTRAINT "payroll_cutoffs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_cutoffs" ADD CONSTRAINT "payroll_cutoffs_locked_by_fkey" FOREIGN KEY ("locked_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_requests" ADD CONSTRAINT "time_requests_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_requests" ADD CONSTRAINT "time_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_requests" ADD CONSTRAINT "time_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overtime_policies" ADD CONSTRAINT "overtime_policies_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
