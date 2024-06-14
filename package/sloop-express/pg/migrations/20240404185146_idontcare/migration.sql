/*
  Warnings:

  - You are about to drop the `_Attendee` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Attendee" DROP CONSTRAINT "_Attendee_A_fkey";

-- DropForeignKey
ALTER TABLE "_Attendee" DROP CONSTRAINT "_Attendee_B_fkey";

-- DropTable
DROP TABLE "_Attendee";

-- CreateTable
CREATE TABLE "Attendee" (
    "id" VARCHAR(21) NOT NULL,
    "userId" VARCHAR(21) NOT NULL,
    "meetingId" VARCHAR(21) NOT NULL,

    CONSTRAINT "Attendee_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Attendee" ADD CONSTRAINT "Attendee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendee" ADD CONSTRAINT "Attendee_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
