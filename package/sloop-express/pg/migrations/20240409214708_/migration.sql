/*
  Warnings:

  - You are about to drop the column `delegateeId` on the `Delegation` table. All the data in the column will be lost.
  - You are about to drop the column `delegatorId` on the `Delegation` table. All the data in the column will be lost.
  - You are about to drop the column `meetingId` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `pointAgendaId` on the `Vote` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Vote` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[delegatedById,delegatedToId,votingGroupId]` on the table `Delegation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `delegatedById` to the `Delegation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `delegatedToId` to the `Delegation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `Delegation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupId` to the `Proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ofChoiceId` to the `Vote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ofVotingId` to the `Vote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `Vote` table without a default value. This is not possible if the table is not empty.
  - Made the column `delegatedToId` on table `Vote` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Delegation" DROP CONSTRAINT "Delegation_delegateeId_fkey";

-- DropForeignKey
ALTER TABLE "Delegation" DROP CONSTRAINT "Delegation_delegatorId_fkey";

-- DropForeignKey
ALTER TABLE "Proposal" DROP CONSTRAINT "Proposal_meetingId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_delegatedToId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_meetingId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_pointAgendaId_fkey";

-- DropIndex
DROP INDEX "Delegation_delegatorId_delegateeId_votingGroupId_key";

-- AlterTable
ALTER TABLE "Delegation" DROP COLUMN "delegateeId",
DROP COLUMN "delegatorId",
ADD COLUMN     "delegatedById" VARCHAR(21) NOT NULL,
ADD COLUMN     "delegatedToId" VARCHAR(21) NOT NULL,
ADD COLUMN     "weight" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Proposal" DROP COLUMN "meetingId",
ADD COLUMN     "groupId" VARCHAR(21) NOT NULL;

-- AlterTable
ALTER TABLE "Vote" DROP COLUMN "pointAgendaId",
DROP COLUMN "value",
ADD COLUMN     "ofChoiceId" VARCHAR(21) NOT NULL,
ADD COLUMN     "ofVotingId" VARCHAR(21) NOT NULL,
ADD COLUMN     "weight" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "meetingId" DROP NOT NULL,
ALTER COLUMN "delegatedToId" SET NOT NULL;

-- CreateTable
CREATE TABLE "Choice" (
    "id" VARCHAR(21) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "proposalId" VARCHAR(21) NOT NULL,

    CONSTRAINT "Choice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voting" (
    "id" VARCHAR(21) NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "proposalId" VARCHAR(21) NOT NULL,
    "choiceId" VARCHAR(21) NOT NULL,
    "meetingId" VARCHAR(21) NOT NULL,
    "agendaPointId" VARCHAR(21) NOT NULL,
    "votingGroupId" VARCHAR(21) NOT NULL,

    CONSTRAINT "Voting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Delegation_delegatedById_delegatedToId_votingGroupId_key" ON "Delegation"("delegatedById", "delegatedToId", "votingGroupId");

-- AddForeignKey
ALTER TABLE "Delegation" ADD CONSTRAINT "Delegation_delegatedById_fkey" FOREIGN KEY ("delegatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delegation" ADD CONSTRAINT "Delegation_delegatedToId_fkey" FOREIGN KEY ("delegatedToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Choice" ADD CONSTRAINT "Choice_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voting" ADD CONSTRAINT "Voting_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voting" ADD CONSTRAINT "Voting_choiceId_fkey" FOREIGN KEY ("choiceId") REFERENCES "Choice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voting" ADD CONSTRAINT "Voting_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voting" ADD CONSTRAINT "Voting_agendaPointId_fkey" FOREIGN KEY ("agendaPointId") REFERENCES "PointAgenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voting" ADD CONSTRAINT "Voting_votingGroupId_fkey" FOREIGN KEY ("votingGroupId") REFERENCES "VotingGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_ofVotingId_fkey" FOREIGN KEY ("ofVotingId") REFERENCES "Voting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_delegatedToId_fkey" FOREIGN KEY ("delegatedToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_ofChoiceId_fkey" FOREIGN KEY ("ofChoiceId") REFERENCES "Choice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
