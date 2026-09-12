-- CreateTable
CREATE TABLE "slot_rounds" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "betAmount" DOUBLE PRECISION NOT NULL,
    "winAmount" DOUBLE PRECISION NOT NULL,
    "reelMatrix" JSONB NOT NULL,
    "paylinesWon" JSONB NOT NULL,
    "serverSeed" TEXT NOT NULL,
    "clientSeed" TEXT,
    "nonce" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "slot_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "slot_rounds_userId_idx" ON "slot_rounds"("userId");

-- CreateIndex
CREATE INDEX "slot_rounds_createdAt_idx" ON "slot_rounds"("createdAt");

-- AddForeignKey
ALTER TABLE "slot_rounds" ADD CONSTRAINT "slot_rounds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
