/*
  Warnings:

  - You are about to drop the column `creatorId` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `Meeting` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Voting" DROP CONSTRAINT "Voting_createdById_fkey";

-- DropIndex
DROP INDEX "Session_token_key";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Meeting" DROP COLUMN "creatorId",
ADD COLUMN     "createdById" VARCHAR(21) NOT NULL;

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "token";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "passwordHash";

-- CreateTable
CREATE TABLE "ConfidentialUser" (
    "id" VARCHAR(21) NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "userId" VARCHAR(21) NOT NULL,

    CONSTRAINT "ConfidentialUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfidentialSession" (
    "token" TEXT NOT NULL,
    "sessionId" VARCHAR(21) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfidentialUser_email_key" ON "ConfidentialUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ConfidentialUser_userId_key" ON "ConfidentialUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConfidentialSession_token_key" ON "ConfidentialSession"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ConfidentialSession_sessionId_key" ON "ConfidentialSession"("sessionId");

-- AddForeignKey
ALTER TABLE "ConfidentialUser" ADD CONSTRAINT "ConfidentialUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfidentialSession" ADD CONSTRAINT "ConfidentialSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voting" ADD CONSTRAINT "Voting_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
