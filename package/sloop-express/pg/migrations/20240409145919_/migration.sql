/*
  Warnings:

  - You are about to drop the column `equipageId` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the `Equipage` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `groupId` to the `Meeting` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_equipageId_fkey";

-- DropForeignKey
ALTER TABLE "_captains" DROP CONSTRAINT "_captains_A_fkey";

-- DropForeignKey
ALTER TABLE "_members" DROP CONSTRAINT "_members_A_fkey";

-- AlterTable
ALTER TABLE "Meeting" DROP COLUMN "equipageId",
ADD COLUMN     "groupId" VARCHAR(21) NOT NULL;

-- DropTable
DROP TABLE "Equipage";

-- CreateTable
CREATE TABLE "Group" (
    "id" VARCHAR(21) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_captains" ADD CONSTRAINT "_captains_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_members" ADD CONSTRAINT "_members_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
