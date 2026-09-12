import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Role, TransactionStatus, TransactionType, UserStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalDepositsAgg,
      totalWithdrawalsAgg,
      totalBetsAgg,
      totalWinsAgg,
      pendingWithdrawalsCount,
      recentTransactions,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: Role.USER } }),
      this.prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      this.prisma.transaction.aggregate({
        where: { type: TransactionType.DEPOSIT, status: TransactionStatus.COMPLETED },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { type: TransactionType.WITHDRAWAL, status: TransactionStatus.COMPLETED },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { type: TransactionType.BET },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { type: TransactionType.WIN },
        _sum: { amount: true },
      }),
      this.prisma.transaction.count({
        where: { type: TransactionType.WITHDRAWAL, status: TransactionStatus.PENDING },
      }),
      this.prisma.transaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { user: { select: { email: true, username: true } } },
      }),
    ]);

    const totalDeposits = totalDepositsAgg._sum.amount || 0;
    const totalWithdrawals = totalWithdrawalsAgg._sum.amount || 0;
    const totalBets = totalBetsAgg._sum.amount || 0;
    const totalWins = totalWinsAgg._sum.amount || 0;
    const ggr = totalBets - totalWins;

    return {
      totalUsers,
      activeUsers,
      totalDeposits,
      totalWithdrawals,
      netRevenue: totalDeposits - totalWithdrawals,
      grossGamingRevenue: ggr,
      pendingWithdrawalsCount,
      recentTransactions,
    };
  }

  async getUsers(search?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search && search.trim()) {
      where.OR = [
        { email: { contains: search.trim(), mode: 'insensitive' } },
        { username: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: { wallet: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => ({
        id: u.id,
        email: u.email,
        username: u.username,
        phone: u.phone,
        role: u.role,
        vipLevel: u.vipLevel,
        status: u.status,
        createdAt: u.createdAt,
        realBalance: u.wallet?.realBalance || 0,
        bonusBalance: u.wallet?.bonusBalance || 0,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async adjustUserBalance(userId: string, amount: number, isCredit: boolean, reason: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    if (!isCredit && wallet.realBalance < amount) {
      throw new BadRequestException('Cannot deduct more than user current balance');
    }

    return await this.prisma.$transaction(async (tx) => {
      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          realBalance: isCredit ? { increment: amount } : { decrement: amount },
        },
      });

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          userId,
          type: isCredit ? TransactionType.BONUS : TransactionType.WITHDRAWAL,
          amount,
          currency: wallet.currency,
          status: TransactionStatus.COMPLETED,
          paymentMethod: 'ADMIN_MANUAL_ADJUSTMENT',
          metadata: JSON.stringify({ reason, timestamp: new Date().toISOString() }),
        },
      });

      return updated;
    });
  }

  async toggleUserStatus(userId: string, status: UserStatus) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status },
      select: { id: true, email: true, status: true },
    });
  }

  async getGames(category?: any, provider?: any) {
    const where: any = {};
    if (category) where.category = category;
    if (provider) where.provider = provider;

    return this.prisma.game.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { playCount: 'desc' }],
    });
  }

  async toggleGameStatus(gameId: string, active: boolean) {
    return this.prisma.game.update({
      where: { id: gameId },
      data: { active },
    });
  }

  async getTransactions(status?: TransactionStatus, type?: TransactionType, page = 1, limit = 25) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: { user: { select: { email: true, username: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async reviewWithdrawal(transactionId: string, action: 'APPROVE' | 'REJECT', reason?: string) {
    const tx = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { wallet: true },
    });

    if (!tx || tx.type !== TransactionType.WITHDRAWAL) {
      throw new NotFoundException('Withdrawal transaction not found');
    }

    if (tx.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Transaction has already been reviewed');
    }

    return await this.prisma.$transaction(async (prismaTx) => {
      if (action === 'APPROVE') {
        // Clear locked balance
        await prismaTx.wallet.update({
          where: { id: tx.walletId },
          data: {
            lockedBalance: { decrement: tx.amount },
          },
        });

        const updatedTx = await prismaTx.transaction.update({
          where: { id: transactionId },
          data: {
            status: TransactionStatus.COMPLETED,
            metadata: JSON.stringify({
              approvedAt: new Date().toISOString(),
              reason: reason || 'Approved by compliance',
            }),
          },
        });

        return { success: true, message: 'Withdrawal approved and marked completed', transaction: updatedTx };
      } else {
        // Refund locked balance back to real balance
        await prismaTx.wallet.update({
          where: { id: tx.walletId },
          data: {
            lockedBalance: { decrement: tx.amount },
            realBalance: { increment: tx.amount },
          },
        });

        const updatedTx = await prismaTx.transaction.update({
          where: { id: transactionId },
          data: {
            status: TransactionStatus.REJECTED,
            metadata: JSON.stringify({
              rejectedAt: new Date().toISOString(),
              reason: reason || 'Rejected by compliance. Funds refunded.',
            }),
          },
        });

        return { success: true, message: 'Withdrawal rejected and funds refunded to player balance', transaction: updatedTx };
      }
    });
  }
}
