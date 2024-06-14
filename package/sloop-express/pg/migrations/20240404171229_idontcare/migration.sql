/*
  Warnings:

  - You are about to drop the column `description` on the `TimelineElement` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `TimelineElement` table. All the data in the column will be lost.
  - Added the required column `type` to the `TimelineElement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TimelineElement" DROP COLUMN "description",
DROP COLUMN "name",
ADD COLUMN     "type" TEXT NOT NULL;
