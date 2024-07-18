/*
  Warnings:

  - A unique constraint covering the columns `[remoteId,provider]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `remoteId` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "remoteId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Account_remoteId_provider_key" ON "Account"("remoteId", "provider");
