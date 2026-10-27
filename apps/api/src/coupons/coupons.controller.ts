import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CreateCouponDto, ToggleCouponStatusDto } from '../common/dto/platform.dto';

@Controller('coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  async getCoupons(@Req() req: any) {
    return this.couponsService.findAll(req.user.userId, req.user.role);
  }

  @Post()
  async createCoupon(@Req() req: any, @Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto, req.user.userId, req.user.role);
  }

  @Patch(':id/status')
  async toggleStatus(@Param('id') id: string, @Body() dto: ToggleCouponStatusDto) {
    return this.couponsService.toggleStatus(id, dto.active);
  }
}
