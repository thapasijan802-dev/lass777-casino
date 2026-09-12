import { Body, Controller, Post, Req } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MinesService } from './mines.service';
import { CashoutMinesDto, RevealTileDto, StartMinesDto } from './mines.types';
import { Public } from '../../../common/decorators/roles.decorator';

@Controller('games/mines')
export class MinesController {
  constructor(
    private readonly minesService: MinesService,
    private readonly jwtService: JwtService,
  ) {}

  private extractUserId(req: any): string | null {
    const authHeader = req.headers?.authorization;
    if (!authHeader) return null;
    const token = authHeader.replace('Bearer ', '');
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'lass777-super-secret-production-key-999-secure-seed',
      });
      return decoded.sub || decoded.id || decoded.userId || null;
    } catch {
      return null;
    }
  }

  @Public()
  @Post('start')
  async start(@Req() req: any, @Body() dto: StartMinesDto) {
    const userId = this.extractUserId(req);
    return this.minesService.startGame(userId, dto);
  }

  @Public()
  @Post('reveal')
  async reveal(@Req() req: any, @Body() dto: RevealTileDto) {
    const userId = this.extractUserId(req);
    return this.minesService.revealTile(userId, dto.sessionId, Number(dto.tileIndex));
  }

  @Public()
  @Post('cashout')
  async cashout(@Req() req: any, @Body() dto: CashoutMinesDto) {
    const userId = this.extractUserId(req);
    return this.minesService.cashout(userId, dto.sessionId);
  }
}
