import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SlotService } from './slot.service';
import { SlotGateway } from './slot.gateway';
import { PrismaService } from '../../../common/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'lass777-super-secret-production-key-999-secure-seed',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [SlotService, SlotGateway, PrismaService],
  exports: [SlotService, SlotGateway],
})
export class SlotModule {}
