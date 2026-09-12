import { Controller, Get, Param, Query } from '@nestjs/common';
import { GamesService } from './games.service';
import { Public } from '../../common/decorators/roles.decorator';
import { GameCategory, GameProviderType } from '@prisma/client';

@Public()
@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Get()
  async getGames(
    @Query('category') category?: GameCategory,
    @Query('provider') provider?: GameProviderType,
    @Query('search') search?: string,
    @Query('isHot') isHot?: string,
    @Query('isFeatured') isFeatured?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.gamesService.findAll({
      category,
      provider,
      search,
      isHot: isHot !== undefined ? isHot === 'true' : undefined,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @Get('categories')
  async getCategories() {
    return this.gamesService.getCategories();
  }

  @Get('providers')
  async getProviders() {
    return this.gamesService.getProviders();
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.gamesService.findBySlug(slug);
  }
}
