-- CreateEnum
CREATE TYPE "CrashRoundStatus" AS ENUM ('BETTING', 'RUNNING', 'CRASHED');

-- CreateEnum
CREATE TYPE "CrashBetStatus" AS ENUM ('PENDING', 'CASHED_OUT', 'BUSTED');

-- CreateEnum
CREATE TYPE "MinesSessionStatus" AS ENUM ('ACTIVE', 'CASHED_OUT', 'EXPLODED');

-- CreateTable
CREATE TABLE "crash_rounds" (
    "id" TEXT NOT NULL,
    "crashPoint" DOUBLE PRECISION NOT NULL,
    "serverSeed" TEXT NOT NULL,
    "serverSeedHash" TEXT NOT NULL,
    "clientSeed" TEXT,
    "nonce" INTEGER NOT NULL,
    "status" "CrashRoundStatus" NOT NULL DEFAULT 'BETTING',
    "crashedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crash_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crash_bets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "betAmount" DOUBLE PRECISION NOT NULL,
    "cashoutMultiplier" DOUBLE PRECISION,
    "payout" DOUBLE PRECISION,
    "status" "CrashBetStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crash_bets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mines_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "betAmount" DOUBLE PRECISION NOT NULL,
    "mineCount" INTEGER NOT NULL,
    "minePositions" INTEGER[],
    "revealedTiles" INTEGER[],
    "currentMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "status" "MinesSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "serverSeed" TEXT NOT NULL,
    "clientSeed" TEXT,
    "nonce" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mines_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "crash_rounds_status_idx" ON "crash_rounds"("status");

-- CreateIndex
CREATE INDEX "crash_rounds_createdAt_idx" ON "crash_rounds"("createdAt");

-- CreateIndex
CREATE INDEX "crash_bets_userId_idx" ON "crash_bets"("userId");

-- CreateIndex
CREATE INDEX "crash_bets_roundId_idx" ON "crash_bets"("roundId");

-- CreateIndex
CREATE INDEX "crash_bets_status_idx" ON "crash_bets"("status");

-- CreateIndex
CREATE INDEX "mines_sessions_userId_idx" ON "mines_sessions"("userId");

-- CreateIndex
CREATE INDEX "mines_sessions_status_idx" ON "mines_sessions"("status");

-- CreateIndex
CREATE INDEX "mines_sessions_createdAt_idx" ON "mines_sessions"("createdAt");

-- AddForeignKey
ALTER TABLE "crash_bets" ADD CONSTRAINT "crash_bets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crash_bets" ADD CONSTRAINT "crash_bets_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "crash_rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mines_sessions" ADD CONSTRAINT "mines_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
