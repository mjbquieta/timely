/*
  Warnings:

  - Made the column `owner_id` on table `company` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."company" ALTER COLUMN "owner_id" SET NOT NULL;
