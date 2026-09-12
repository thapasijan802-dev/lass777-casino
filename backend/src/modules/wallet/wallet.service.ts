import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { DepositDto, WithdrawDto } from './dto/wallet.dto';
import { BonusStatus, BonusType, TransactionStatus, TransactionType } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getBalance(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return {
      realBalance: wallet.realBalance,
      bonusBalance: wallet.bonusBalance,
      totalBalance: wallet.realBalance + wallet.bonusBalance,
      lockedBalance: wallet.lockedBalance,
      currency: wallet.currency,
    };
  }

  async deposit(userId: string, dto: DepositDto) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Process deposit atomically
    const txHash = 'tx_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);

    let matchBonusAmount = 0;
    if (dto.bonusCode?.toUpperCase() === 'WELCOME200' || dto.bonusCode?.toUpperCase() === 'LASS100') {
      matchBonusAmount = Number((dto.amount * 1.0).toFixed(2)); // 100% deposit match
    }

    return await this.prisma.$transaction(async (tx) => {
      // 1. Credit Real Balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          realBalance: { increment: dto.amount },
          bonusBalance: { increment: matchBonusAmount },
        },
      });

      // 2. Create Deposit Transaction
      const transaction = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          userId,
          type: TransactionType.DEPOSIT,
          amount: dto.amount,
          currency: wallet.currency,
          status: TransactionStatus.COMPLETED,
          paymentMethod: dto.method,
          txHash,
          metadata: JSON.stringify({
            processedAt: new Date().toISOString(),
            gateway: 'WhiteLabel-Aggregator-Pay',
          }),
        },
      });

      // 3. Create Bonus Record if code applied
      if (matchBonusAmount > 0) {
        await tx.bonus.create({
          data: {
            userId,
            code: dto.bonusCode.toUpperCase(),
            type: BonusType.WELCOME_BONUS,
            amount: matchBonusAmount,
            wageringRequired: matchBonusAmount * 30, // 30x wagering
            wageringProgress: 0.0,
            status: BonusStatus.ACTIVE,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });

        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            userId,
            type: TransactionType.BONUS,
            amount: matchBonusAmount,
            currency: wallet.currency,
            status: TransactionStatus.COMPLETED,
            paymentMethod: 'DEPOSIT_MATCH_PROMO',
          },
        });
      }

      return {
        success: true,
        message: `Successfully deposited $${dto.amount.toFixed(2)}${matchBonusAmount > 0 ? ` + $${matchBonusAmount.toFixed(2)} Match Bonus!` : ''}`,
        transactionId: transaction.id,
        newBalance: {
          realBalance: updatedWallet.realBalance,
          bonusBalance: updatedWallet.bonusBalance,
          totalBalance: updatedWallet.realBalance + updatedWallet.bonusBalance,
        },
      };
    });
  }

  async withdraw(userId: string, dto: WithdrawDto) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.realBalance < dto.amount) {
      throw new BadRequestException('Insufficient real money balance for withdrawal');
    }

    // Lock the requested withdrawal amount
    return await this.prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          realBalance: { decrement: dto.amount },
          lockedBalance: { increment: dto.amount },
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          userId,
          type: TransactionType.WITHDRAWAL,
          amount: dto.amount,
          currency: wallet.currency,
          status: TransactionStatus.PENDING,
          paymentMethod: dto.method,
          metadata: JSON.stringify({
            destinationAddress: dto.destinationAddress,
            requestedAt: new Date().toISOString(),
          }),
        },
      });

      return {
        success: true,
        message: `Withdrawal request for $${dto.amount.toFixed(2)} submitted successfully. Our compliance team will review shortly.`,
        transactionId: transaction.id,
        status: transaction.status,
        newBalance: {
          realBalance: updatedWallet.realBalance,
          lockedBalance: updatedWallet.lockedBalance,
        },
      };
    });
  }

  async getTransactions(userId: string, type?: TransactionType, status?: TransactionStatus, limit = 20) {
    const where: any = { userId };
    if (type) where.type = type;
    if (status) where.status = status;

    return this.prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
