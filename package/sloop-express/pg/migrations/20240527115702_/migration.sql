/*
  Warnings:

  - Added the required column `authorId` to the `Proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Proposal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "authorId" VARCHAR(21) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" VARCHAR(21) NOT NULL,
ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ProposalContent" (
    "id" VARCHAR(21) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proposalId" VARCHAR(21) NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "ProposalContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_coauthors" (
    "A" VARCHAR(21) NOT NULL,
    "B" VARCHAR(21) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_coauthors_AB_unique" ON "_coauthors"("A", "B");

-- CreateIndex
CREATE INDEX "_coauthors_B_index" ON "_coauthors"("B");

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalContent" ADD CONSTRAINT "ProposalContent_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_coauthors" ADD CONSTRAINT "_coauthors_A_fkey" FOREIGN KEY ("A") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_coauthors" ADD CONSTRAINT "_coauthors_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
