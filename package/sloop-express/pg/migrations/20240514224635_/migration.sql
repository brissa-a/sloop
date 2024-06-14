/*
  Warnings:

  - You are about to drop the column `startedBySssionId` on the `Voting` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Voting" DROP CONSTRAINT "Voting_startedBySssionId_fkey";

-- AlterTable
ALTER TABLE "Voting" DROP COLUMN "startedBySssionId",
ADD COLUMN     "startedBySessionId" VARCHAR(21);

-- AddForeignKey
ALTER TABLE "Voting" ADD CONSTRAINT "Voting_startedBySessionId_fkey" FOREIGN KEY ("startedBySessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
