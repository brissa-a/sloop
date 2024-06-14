-- CreateTable
CREATE TABLE "ProposalLogEntry" (
    "id" VARCHAR(21) NOT NULL,
    "proposalId" VARCHAR(21) NOT NULL,
    "entryId" VARCHAR(21) NOT NULL,

    CONSTRAINT "ProposalLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupLogEntry" (
    "id" VARCHAR(21) NOT NULL,
    "groupId" VARCHAR(21) NOT NULL,
    "entryId" VARCHAR(21) NOT NULL,

    CONSTRAINT "GroupLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VotingLogEntry" (
    "id" VARCHAR(21) NOT NULL,
    "votingId" VARCHAR(21) NOT NULL,
    "entryId" VARCHAR(21) NOT NULL,

    CONSTRAINT "VotingLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProposalLogEntry_proposalId_idx" ON "ProposalLogEntry"("proposalId");

-- CreateIndex
CREATE INDEX "GroupLogEntry_groupId_idx" ON "GroupLogEntry"("groupId");

-- CreateIndex
CREATE INDEX "VotingLogEntry_votingId_idx" ON "VotingLogEntry"("votingId");

-- AddForeignKey
ALTER TABLE "ProposalLogEntry" ADD CONSTRAINT "ProposalLogEntry_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalLogEntry" ADD CONSTRAINT "ProposalLogEntry_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "LogEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupLogEntry" ADD CONSTRAINT "GroupLogEntry_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupLogEntry" ADD CONSTRAINT "GroupLogEntry_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "LogEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingLogEntry" ADD CONSTRAINT "VotingLogEntry_votingId_fkey" FOREIGN KEY ("votingId") REFERENCES "Voting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingLogEntry" ADD CONSTRAINT "VotingLogEntry_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "LogEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
