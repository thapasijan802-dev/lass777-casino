import { Module } from '@nestjs/common';
import { BonusController } from './bonus.controller';
import { BonusService } from './bonus.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [BonusController],
  providers: [BonusService, PrismaService],
  exports: [BonusService],
})
export class BonusModule {}
