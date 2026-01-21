-- AlterTable
ALTER TABLE "public"."branches" ADD COLUMN     "company_id" TEXT;

-- CreateTable
CREATE TABLE "public"."company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address_1" TEXT,
    "address_2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "country" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."branches" ADD CONSTRAINT "branches_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
