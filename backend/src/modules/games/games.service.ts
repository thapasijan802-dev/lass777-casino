import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { GameCategory, GameProviderType } from '@prisma/client';

export interface GameQueryFilters {
  category?: GameCategory;
  provider?: GameProviderType;
  search?: string;
  isHot?: boolean;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: GameQueryFilters) {
    const { category, provider, search, isHot, isFeatured, page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const where: any = { active: true };

    if (category) {
      where.category = category;
    }

    if (provider) {
      where.provider = provider;
    }

    if (isHot !== undefined) {
      where.isHot = isHot;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (search && search.trim().length > 0) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [games, total] = await Promise.all([
      this.prisma.game.findMany({
        where,
        orderBy: [{ isFeatured: 'desc' }, { playCount: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.game.count({ where }),
    ]);

    return {
      data: games,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string) {
    const game = await this.prisma.game.findUnique({
      where: { slug },
    });

    if (!game) {
      throw new NotFoundException(`Game '${slug}' not found`);
    }

    // Fetch related games in same category
    const related = await this.prisma.game.findMany({
      where: {
        category: game.category,
        slug: { not: slug },
        active: true,
      },
      take: 6,
    });

    return {
      game,
      related,
    };
  }

  async getCategories() {
    const counts = await this.prisma.game.groupBy({
      by: ['category'],
      where: { active: true },
      _count: { id: true },
    });

    return counts.map((c) => ({
      category: c.category,
      count: c._count.id,
    }));
  }

  async getProviders() {
    const counts = await this.prisma.game.groupBy({
      by: ['provider'],
      where: { active: true },
      _count: { id: true },
    });

    return counts.map((p) => ({
      provider: p.provider,
      count: p._count.id,
    }));
  }
}
