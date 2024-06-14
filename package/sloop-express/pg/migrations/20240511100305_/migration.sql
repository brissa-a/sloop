/*
  Warnings:

  - The values [BORDA,SCORE_VOTING] on the enum `VotingMethod` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `slug` to the `Voting` table without a default value. This is not possible if the table is not empty.
  - Made the column `endAt` on table `Voting` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VotingMethod_new" AS ENUM ('SINGLE_NAME', 'APPROVAL', 'JUGEMENT_MAJORITAIRE');
ALTER TABLE "Voting" ALTER COLUMN "votingMethod" TYPE "VotingMethod_new" USING ("votingMethod"::text::"VotingMethod_new");
ALTER TYPE "VotingMethod" RENAME TO "VotingMethod_old";
ALTER TYPE "VotingMethod_new" RENAME TO "VotingMethod";
DROP TYPE "VotingMethod_old";
COMMIT;

-- AlterTable
ALTER TABLE "Voting" ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "endedBySessionId" VARCHAR(21),
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "startedBySssionId" VARCHAR(21),
ALTER COLUMN "endAt" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Voting" ADD CONSTRAINT "Voting_startedBySssionId_fkey" FOREIGN KEY ("startedBySssionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voting" ADD CONSTRAINT "Voting_endedBySessionId_fkey" FOREIGN KEY ("endedBySessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
