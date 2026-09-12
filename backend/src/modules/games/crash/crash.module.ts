import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CrashService } from './crash.service';
import { CrashGateway } from './crash.gateway';
import { PrismaService } from '../../../common/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'lass777-super-secret-production-key-999-secure-seed',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [CrashService, CrashGateway, PrismaService],
  exports: [CrashService, CrashGateway],
})
export class CrashModule {}
