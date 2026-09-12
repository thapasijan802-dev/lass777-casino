import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MinesService } from './mines.service';
import { MinesController } from './mines.controller';
import { PrismaService } from '../../../common/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'lass777-super-secret-production-key-999-secure-seed',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [MinesController],
  providers: [MinesService, PrismaService],
  exports: [MinesService],
})
export class MinesModule {}
