/*
  Warnings:

  - You are about to drop the column `lastAccessedAt` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "lastAccessedAt",
DROP COLUMN "updatedAt";

-- CreateTable
CREATE TABLE "AccessTokenGenerated" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessTokenGenerated_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AccessTokenGenerated" ADD CONSTRAINT "AccessTokenGenerated_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
