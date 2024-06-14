/*
  Warnings:

  - You are about to drop the column `type` on the `Group` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Group" DROP COLUMN "type";

-- DropEnum
DROP TYPE "GroupType";
