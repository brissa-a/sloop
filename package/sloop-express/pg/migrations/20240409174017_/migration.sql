/*
  Warnings:

  - A unique constraint covering the columns `[delegatorId,delegateeId,votingGroupId]` on the table `Delegation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Delegation_delegatorId_delegateeId_votingGroupId_key" ON "Delegation"("delegatorId", "delegateeId", "votingGroupId");
