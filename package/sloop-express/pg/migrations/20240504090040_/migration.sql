/*
  Warnings:

  - You are about to drop the column `userId` on the `MeetingMessage` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `VotingGroupDelegation` table. All the data in the column will be lost.
  - You are about to drop the column `votingMethod` on the `VotingProposal` table. All the data in the column will be lost.
  - You are about to drop the column `votingMethodParam` on the `VotingProposal` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `VotingVote` table. All the data in the column will be lost.
  - Added the required column `fromUserId` to the `MeetingMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Voting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `votingMethod` to the `Voting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `votingMethodParams` to the `Voting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `power` to the `VotingGroupDelegation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastModifiedAt` to the `VotingVote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `power` to the `VotingVote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MeetingMessage" DROP CONSTRAINT "MeetingMessage_userId_fkey";

-- DropForeignKey
ALTER TABLE "Voting" DROP CONSTRAINT "Voting_proposalId_fkey";

-- DropForeignKey
ALTER TABLE "VotingChoice" DROP CONSTRAINT "VotingChoice_proposalId_fkey";

-- AlterTable
ALTER TABLE "MeetingMessage" DROP COLUMN "userId",
ADD COLUMN     "fromUserId" VARCHAR(21) NOT NULL;

-- AlterTable
ALTER TABLE "Voting" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" VARCHAR(21) NOT NULL,
ADD COLUMN     "votingMethod" "VotingMethod" NOT NULL,
ADD COLUMN     "votingMethodParams" JSONB NOT NULL,
ALTER COLUMN "endAt" DROP NOT NULL,
ALTER COLUMN "proposalId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "VotingChoice" ALTER COLUMN "proposalId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "VotingGroupDelegation" DROP COLUMN "weight",
ADD COLUMN     "power" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "VotingProposal" DROP COLUMN "votingMethod",
DROP COLUMN "votingMethodParam";

-- AlterTable
ALTER TABLE "VotingVote" DROP COLUMN "weight",
ADD COLUMN     "lastModifiedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "likeUserId" VARCHAR(21),
ADD COLUMN     "power" INTEGER NOT NULL,
ALTER COLUMN "score" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "MeetingMessage" ADD CONSTRAINT "MeetingMessage_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voting" ADD CONSTRAINT "Voting_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voting" ADD CONSTRAINT "Voting_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "VotingProposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingChoice" ADD CONSTRAINT "VotingChoice_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "VotingProposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingVote" ADD CONSTRAINT "VotingVote_likeUserId_fkey" FOREIGN KEY ("likeUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
