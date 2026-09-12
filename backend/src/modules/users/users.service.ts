import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        bonuses: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    const totalBets = await this.prisma.transaction.aggregate({
      where: { userId, type: 'BET' },
      _sum: { amount: true },
    });

    const totalWins = await this.prisma.transaction.aggregate({
      where: { userId, type: 'WIN' },
      _sum: { amount: true },
    });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      phone: user.phone,
      role: user.role,
      vipLevel: user.vipLevel,
      status: user.status,
      wallet: user.wallet,
      bonuses: user.bonuses,
      recentTransactions: user.transactions,
      stats: {
        totalWagered: totalBets._sum.amount || 0,
        totalWon: totalWins._sum.amount || 0,
        netProfit: (totalWins._sum.amount || 0) - (totalBets._sum.amount || 0),
      },
    };
  }

  async updateProfile(userId: string, data: { phone?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        phone: data.phone,
      },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        vipLevel: true,
      },
    });
  }
}
