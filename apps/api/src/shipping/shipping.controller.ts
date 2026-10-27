import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('shipping')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get()
  async getProfiles(@Req() req: any) {
    return this.shippingService.findAll(req.user.userId, req.user.role);
  }

  @Post()
  async createProfile(@Req() req: any, @Body() body: any) {
    return this.shippingService.create(body, req.user.userId, req.user.role);
  }

  @Patch(':id/active')
  async updateActiveStatus(@Param('id') id: string, @Body('active') active: boolean) {
    return this.shippingService.updateActiveStatus(id, active);
  }
}
