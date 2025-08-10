-- DropIndex
DROP INDEX "public"."reservations_number_key";

-- AlterTable
ALTER TABLE "public"."reservations" ALTER COLUMN "number" DROP DEFAULT;
DROP SEQUENCE "reservations_number_seq";
