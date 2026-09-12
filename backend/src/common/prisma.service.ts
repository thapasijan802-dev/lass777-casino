import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Connected to database via Prisma');
    } catch (error) {
      console.warn('⚠️ Prisma connection warning (running with mock or waiting for DB):', error.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
