/*
  Warnings:

  - Added the required column `slug` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Made the column `equipageId` on table `Meeting` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_equipageId_fkey";

-- DropIndex
DROP INDEX "Equipage_slug_key";

-- DropIndex
DROP INDEX "User_slug_key";

-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "slug" TEXT NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "equipageId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_equipageId_fkey" FOREIGN KEY ("equipageId") REFERENCES "Equipage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
