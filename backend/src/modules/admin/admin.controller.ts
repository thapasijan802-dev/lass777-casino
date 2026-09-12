import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, TransactionStatus, TransactionType, UserStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async getUsers(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getUsers(search, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20);
  }

  @Patch('users/:id/balance')
  async adjustBalance(
    @Param('id') id: string,
    @Body() body: { amount: number; isCredit: boolean; reason: string },
  ) {
    return this.adminService.adjustUserBalance(id, body.amount, body.isCredit, body.reason);
  }

  @Patch('users/:id/status')
  async toggleStatus(
    @Param('id') id: string,
    @Body() body: { status: UserStatus },
  ) {
    return this.adminService.toggleUserStatus(id, body.status);
  }

  @Get('games')
  async getGames(@Query('category') category?: any, @Query('provider') provider?: any) {
    return this.adminService.getGames(category, provider);
  }

  @Patch('games/:id/toggle')
  async toggleGame(@Param('id') id: string, @Body() body: { active: boolean }) {
    return this.adminService.toggleGameStatus(id, body.active);
  }

  @Get('transactions')
  async getTransactions(
    @Query('status') status?: TransactionStatus,
    @Query('type') type?: TransactionType,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getTransactions(status, type, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 25);
  }

  @Patch('transactions/:id/review')
  async reviewWithdrawal(
    @Param('id') id: string,
    @Body() body: { action: 'APPROVE' | 'REJECT'; reason?: string },
  ) {
    return this.adminService.reviewWithdrawal(id, body.action, body.reason);
  }
}
