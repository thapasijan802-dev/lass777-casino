import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { DepositDto, WithdrawDto } from './dto/wallet.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TransactionStatus, TransactionType } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('balance')
  async getBalance(@CurrentUser('id') userId: string) {
    return this.walletService.getBalance(userId);
  }

  @Post('deposit')
  async deposit(@CurrentUser('id') userId: string, @Body() dto: DepositDto) {
    return this.walletService.deposit(userId, dto);
  }

  @Post('withdraw')
  async withdraw(@CurrentUser('id') userId: string, @Body() dto: WithdrawDto) {
    return this.walletService.withdraw(userId, dto);
  }

  @Get('transactions')
  async getTransactions(
    @CurrentUser('id') userId: string,
    @Query('type') type?: TransactionType,
    @Query('status') status?: TransactionStatus,
    @Query('limit') limit?: string,
  ) {
    return this.walletService.getTransactions(userId, type, status, limit ? parseInt(limit, 10) : 20);
  }
}
