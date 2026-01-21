-- AlterEnum
ALTER TYPE "public"."UserType" ADD VALUE 'COMPANY_OWNER';

-- AlterTable
ALTER TABLE "public"."company" ADD COLUMN     "owner_id" TEXT;

-- AddForeignKey
ALTER TABLE "public"."company" ADD CONSTRAINT "company_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
