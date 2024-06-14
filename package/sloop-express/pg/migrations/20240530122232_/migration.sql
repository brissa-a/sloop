/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Group` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `joinConditionMd` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leaveConditionMd` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requireJoinValidation` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requireLeaveValidation` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "joinConditionMd" TEXT NOT NULL,
ADD COLUMN     "leaveConditionMd" TEXT NOT NULL,
ADD COLUMN     "requireJoinValidation" BOOLEAN NOT NULL,
ADD COLUMN     "requireLeaveValidation" BOOLEAN NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Group_slug_key" ON "Group"("slug");
