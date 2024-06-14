/*
  Warnings:

  - You are about to drop the column `endDate` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the column `endedAt` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the column `meetingId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `endAt` on the `Voting` table. All the data in the column will be lost.
  - You are about to drop the column `endedAt` on the `Voting` table. All the data in the column will be lost.
  - You are about to drop the column `startAt` on the `Voting` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `Voting` table. All the data in the column will be lost.
  - You are about to drop the `AppMembership` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_coauthors` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `scheduledEndAt` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduledStartAt` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `autoStartEnd` to the `Voting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduledEndAt` to the `Voting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduledStartAt` to the `Voting` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AppMembership" DROP CONSTRAINT "AppMembership_userId_fkey";

-- DropForeignKey
ALTER TABLE "_coauthors" DROP CONSTRAINT "_coauthors_A_fkey";

-- DropForeignKey
ALTER TABLE "_coauthors" DROP CONSTRAINT "_coauthors_B_fkey";

-- AlterTable
ALTER TABLE "Meeting" DROP COLUMN "endDate",
DROP COLUMN "endedAt",
DROP COLUMN "startDate",
DROP COLUMN "startedAt",
ADD COLUMN     "actualEndAt" TIMESTAMP(3),
ADD COLUMN     "actualStartAt" TIMESTAMP(3),
ADD COLUMN     "scheduledEndAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "scheduledStartAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "meetingId";

-- AlterTable
ALTER TABLE "Voting" DROP COLUMN "endAt",
DROP COLUMN "endedAt",
DROP COLUMN "startAt",
DROP COLUMN "startedAt",
ADD COLUMN     "actualEndAt" TIMESTAMP(3),
ADD COLUMN     "actualStartAt" TIMESTAMP(3),
ADD COLUMN     "autoStartEnd" BOOLEAN NOT NULL,
ADD COLUMN     "scheduledEndAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "scheduledStartAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "AppMembership";

-- DropTable
DROP TABLE "_coauthors";

-- CreateTable
CREATE TABLE "ProposalCoauthor" (
    "id" VARCHAR(21) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proposalId" VARCHAR(21) NOT NULL,
    "userId" VARCHAR(21) NOT NULL,
    "acceptedByCoauthorAt" TIMESTAMP(3),
    "acceptedByAuthorAt" TIMESTAMP(3),

    CONSTRAINT "ProposalCoauthor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_votingOwner" (
    "A" VARCHAR(21) NOT NULL,
    "B" VARCHAR(21) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_votingOwner_AB_unique" ON "_votingOwner"("A", "B");

-- CreateIndex
CREATE INDEX "_votingOwner_B_index" ON "_votingOwner"("B");

-- CreateIndex
CREATE INDEX "Voting_autoStartEnd_actualStartAt_idx" ON "Voting"("autoStartEnd", "actualStartAt");

-- AddForeignKey
ALTER TABLE "ProposalCoauthor" ADD CONSTRAINT "ProposalCoauthor_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalCoauthor" ADD CONSTRAINT "ProposalCoauthor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_votingOwner" ADD CONSTRAINT "_votingOwner_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_votingOwner" ADD CONSTRAINT "_votingOwner_B_fkey" FOREIGN KEY ("B") REFERENCES "Voting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
