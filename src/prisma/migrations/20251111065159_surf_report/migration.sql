-- CreateTable
CREATE TABLE "SurfReport" (
    "id" SERIAL NOT NULL,
    "report" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurfReport_pkey" PRIMARY KEY ("id")
);
