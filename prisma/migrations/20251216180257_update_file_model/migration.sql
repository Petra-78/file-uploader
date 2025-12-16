/*
  Warnings:

  - You are about to drop the column `date` on the `Files` table. All the data in the column will be lost.
  - Added the required column `fileName` to the `Files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `Files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Files" DROP COLUMN "date",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "mimeType" TEXT NOT NULL;
