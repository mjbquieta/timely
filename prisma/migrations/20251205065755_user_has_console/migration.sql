-- CreateEnum
CREATE TYPE "public"."HasConsole" AS ENUM ('ALLOWED', 'DENIED');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "has_console" "public"."HasConsole" NOT NULL DEFAULT 'DENIED';
