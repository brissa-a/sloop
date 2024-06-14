/*
  Warnings:

  - You are about to drop the `VoteUnseen` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VoteUnseen" DROP CONSTRAINT "VoteUnseen_groupId_fkey";

-- DropForeignKey
ALTER TABLE "VoteUnseen" DROP CONSTRAINT "VoteUnseen_userId_fkey";

-- DropForeignKey
ALTER TABLE "VoteUnseen" DROP CONSTRAINT "VoteUnseen_votingId_fkey";

-- DropTable
DROP TABLE "VoteUnseen";

-- CreateTable
CREATE TABLE "VotingUnseen" (
    "id" VARCHAR(21) NOT NULL,
    "votingId" VARCHAR(21) NOT NULL,
    "groupId" VARCHAR(21) NOT NULL,
    "userId" VARCHAR(21) NOT NULL,

    CONSTRAINT "VotingUnseen_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VotingUnseen" ADD CONSTRAINT "VotingUnseen_votingId_fkey" FOREIGN KEY ("votingId") REFERENCES "Voting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingUnseen" ADD CONSTRAINT "VotingUnseen_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingUnseen" ADD CONSTRAINT "VotingUnseen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
