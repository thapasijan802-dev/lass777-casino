import { Body, Controller, Get, Headers, Param, Post, Req, UseGuards } from '@nestjs/common';
import { GameActionCallbackDto, LaunchGameDto, ProviderService } from './provider.service';
import { Public } from '../../common/decorators/roles.decorator';
import { JwtService } from '@nestjs/jwt';

@Controller('provider')
export class ProviderController {
  constructor(
    private providerService: ProviderService,
    private jwtService: JwtService,
  ) {}

  @Public()
  @Post('launch')
  async launchGame(
    @Body() dto: LaunchGameDto,
    @Headers('authorization') authHeader?: string,
  ) {
    let userId: string | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded: any = this.jwtService.decode(token);
        if (decoded && decoded.sub) {
          userId = decoded.sub;
        }
      } catch (e) {
        // guest mode
      }
    }

    return this.providerService.launchGame(userId, dto);
  }

  @Public()
  @Post('callback/bet')
  async callbackBet(@Body() dto: GameActionCallbackDto) {
    return this.providerService.processBet(dto);
  }

  @Public()
  @Post('callback/win')
  async callbackWin(@Body() dto: GameActionCallbackDto) {
    return this.providerService.processWin(dto);
  }

  @Public()
  @Get('session/:token')
  async verifySession(@Param('token') token: string) {
    return this.providerService.verifySession(token);
  }
}
