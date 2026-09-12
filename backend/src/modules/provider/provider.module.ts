import { Module } from '@nestjs/common';
import { ProviderController } from './provider.controller';
import { ProviderService } from './provider.service';
import { MockAggregatorAdapter } from './adapters/mock-aggregator.adapter';
import { SoftSwissAdapter } from './adapters/softswiss.adapter';
import { SlotegratorAdapter } from './adapters/slotegrator.adapter';
import { PrismaService } from '../../common/prisma.service';
import { RedisService } from '../../common/redis.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'lass777-super-secret-production-key-999',
    }),
  ],
  controllers: [ProviderController],
  providers: [
    ProviderService,
    MockAggregatorAdapter,
    SoftSwissAdapter,
    SlotegratorAdapter,
    PrismaService,
    RedisService,
  ],
  exports: [ProviderService],
})
export class ProviderModule {}
