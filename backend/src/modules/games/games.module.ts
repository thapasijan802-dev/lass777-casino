import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { PrismaService } from '../../common/prisma.service';
import { SlotModule } from './slot/slot.module';
import { CrashModule } from './crash/crash.module';
import { MinesModule } from './mines/mines.module';

@Module({
  imports: [SlotModule, CrashModule, MinesModule],
  controllers: [GamesController],
  providers: [GamesService, PrismaService],
  exports: [GamesService, SlotModule, CrashModule, MinesModule],
})
export class GamesModule {}
