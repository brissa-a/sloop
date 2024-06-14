/*
  Warnings:

  - Added the required column `reason` to the `AccessTokenGenerated` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GeneratedReason" AS ENUM ('LOGIN', 'REFRESH');

-- AlterTable
ALTER TABLE "AccessTokenGenerated" ADD COLUMN     "reason" "GeneratedReason" NOT NULL;
