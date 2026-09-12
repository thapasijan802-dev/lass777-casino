import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { BonusStatus, BonusType, TransactionStatus, TransactionType } from '@prisma/client';

@Injectable()
export class BonusService {
  constructor(private prisma: PrismaService) {}

  async getUserBonuses(userId: string) {
    return this.prisma.bonus.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async claimPromoCode(userId: string, code: string) {
    const cleanCode = code.trim().toUpperCase();

    const existingBonus = await this.prisma.bonus.findFirst({
      where: {
        userId,
        code: cleanCode,
      },
    });

    if (existingBonus) {
      throw new BadRequestException('You have already claimed this promo code');
    }

    let bonusAmount = 0;
    let wageringMultiplier = 25;

    if (cleanCode === 'LASS777') {
      bonusAmount = 50.0;
      wageringMultiplier = 20;
    } else if (cleanCode === 'VIPBOOST') {
      bonusAmount = 100.0;
      wageringMultiplier = 30;
    } else if (cleanCode === 'FREESPINS50') {
      bonusAmount = 25.0;
      wageringMultiplier = 15;
    } else {
      throw new BadRequestException('Invalid promo code. Try LASS777 or VIPBOOST');
    }

    return await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundException('Wallet not found');

      // Update bonus balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          bonusBalance: { increment: bonusAmount },
        },
      });

      // Create bonus record
      const bonus = await tx.bonus.create({
        data: {
          userId,
          code: cleanCode,
          type: BonusType.RELOAD,
          amount: bonusAmount,
          wageringRequired: bonusAmount * wageringMultiplier,
          wageringProgress: 0,
          status: BonusStatus.ACTIVE,
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          userId,
          type: TransactionType.BONUS,
          amount: bonusAmount,
          currency: wallet.currency,
          status: TransactionStatus.COMPLETED,
          paymentMethod: `PROMO_${cleanCode}`,
        },
      });

      return {
        success: true,
        message: `Promo code ${cleanCode} claimed! $${bonusAmount.toFixed(2)} added to your bonus balance.`,
        bonus,
        newBalance: {
          bonusBalance: updatedWallet.bonusBalance,
          totalBalance: updatedWallet.realBalance + updatedWallet.bonusBalance,
        },
      };
    });
  }
}
