import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { BonusService } from './bonus.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('bonus')
export class BonusController {
  constructor(private bonusService: BonusService) {}

  @Get('my-bonuses')
  async getMyBonuses(@CurrentUser('id') userId: string) {
    return this.bonusService.getUserBonuses(userId);
  }

  @Post('claim')
  async claimBonus(@CurrentUser('id') userId: string, @Body() body: { code: string }) {
    return this.bonusService.claimPromoCode(userId, body.code);
  }
}
