-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "jobId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "siteAddress" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WIP',
    "email" TEXT,
    "phone" TEXT,
    "gstNo" TEXT,
    "amount" DOUBLE PRECISION DEFAULT 0,
    "costPrice" DOUBLE PRECISION DEFAULT 0,
    "salePrice" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Job_jobId_key" ON "Job"("jobId");
