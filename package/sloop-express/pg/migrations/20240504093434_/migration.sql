-- DropForeignKey
ALTER TABLE "Voting" DROP CONSTRAINT "Voting_agendaPointId_fkey";

-- AlterTable
ALTER TABLE "Voting" ALTER COLUMN "agendaPointId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Voting" ADD CONSTRAINT "Voting_agendaPointId_fkey" FOREIGN KEY ("agendaPointId") REFERENCES "PointAgenda"("id") ON DELETE SET NULL ON UPDATE CASCADE;
