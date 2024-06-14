/*
  Warnings:

  - Added the required column `misc` to the `TimelineElement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TimelineElement" ADD COLUMN     "misc" JSONB NOT NULL;
