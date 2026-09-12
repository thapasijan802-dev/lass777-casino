import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { BonusStatus, BonusType } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email.toLowerCase() }, { username: dto.username }],
      },
    });

    if (existing) {
      throw new BadRequestException('Email or username already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Initial promotional registration bonus ($20 Free chip credited to bonus balance!)
    const freeChipAmount = 20.0;

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        username: dto.username,
        phone: dto.phone || null,
        passwordHash,
        wallet: {
          create: {
            realBalance: 0.0,
            bonusBalance: freeChipAmount,
            currency: 'USD',
          },
        },
        bonuses: {
          create: {
            code: 'FREE20_WELCOME',
            type: BonusType.WELCOME_BONUS,
            amount: freeChipAmount,
            wageringRequired: freeChipAmount * 25, // 25x wagering
            wageringProgress: 0.0,
            status: BonusStatus.ACTIVE,
            expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
        },
      },
      include: {
        wallet: true,
      },
    });

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        vipLevel: user.vipLevel,
        wallet: user.wallet,
      },
      message: 'Registration successful! $20 Welcome Free Bonus credited.',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { wallet: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account suspended. Please contact support.');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        vipLevel: user.vipLevel,
        wallet: user.wallet,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        vipLevel: true,
        status: true,
        createdAt: true,
        wallet: true,
        bonuses: {
          where: { status: BonusStatus.ACTIVE },
          take: 3,
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private generateToken(userId: string, email: string, role: string): string {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }
}
