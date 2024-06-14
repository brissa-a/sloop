/*
  Warnings:

  - You are about to drop the column `admin` on the `User` table. All the data in the column will be lost.
  - Added the required column `isAdmin` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isAdmin` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LogEntry" DROP CONSTRAINT "LogEntry_doneById_fkey";

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL,
ADD COLUMN     "principalId" VARCHAR(21);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "admin",
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_principalId_fkey" FOREIGN KEY ("principalId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_doneById_fkey" FOREIGN KEY ("doneById") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
