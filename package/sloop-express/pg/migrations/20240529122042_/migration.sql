/*
  Warnings:

  - You are about to drop the column `description` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the `ProposalContent` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content` to the `Proposal` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProposalContent" DROP CONSTRAINT "ProposalContent_proposalId_fkey";

-- AlterTable
ALTER TABLE "Proposal" DROP COLUMN "description",
ADD COLUMN     "content" TEXT NOT NULL;

-- DropTable
DROP TABLE "ProposalContent";
