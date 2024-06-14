/*
  Warnings:

  - You are about to alter the column `weight` on the `VotingGroupDelegation` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `weight` on the `VotingVote` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "VotingGroupDelegation" ALTER COLUMN "weight" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "VotingVote" ALTER COLUMN "weight" SET DATA TYPE INTEGER;
