/*
  Warnings:

  - You are about to drop the column `costPrice` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `salePrice` on the `Job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "costPrice",
DROP COLUMN "salePrice",
ADD COLUMN     "calculatedProfit" TEXT,
ADD COLUMN     "disposal" TEXT,
ADD COLUMN     "glue" TEXT,
ADD COLUMN     "hardboard" TEXT,
ADD COLUMN     "labourItem" TEXT,
ADD COLUMN     "scotia" TEXT,
ADD COLUMN     "wastageQuantity" TEXT,
ALTER COLUMN "amount" DROP DEFAULT,
ALTER COLUMN "amount" SET DATA TYPE TEXT;
