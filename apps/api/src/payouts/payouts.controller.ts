import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { RequestPayoutDto, UpdatePayoutStatusDto } from '../common/dto/platform.dto';
import { Roles } from '../common/decorators';

@Controller('payouts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Get()
  async getPayouts(@Req() req: any) {
    return this.payoutsService.findAll(req.user.userId, req.user.role);
  }

  @Roles('SELLER')
  @Post()
  async requestPayout(@Req() req: any, @Body() dto: RequestPayoutDto) {
    return this.payoutsService.requestPayout(req.user.userId, dto.amount);
  }

  @Roles('ADMIN')
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdatePayoutStatusDto) {
    return this.payoutsService.updateStatus(id, dto.status, dto.reference);
  }
}
